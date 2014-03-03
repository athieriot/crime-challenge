var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var device  = require('express-device');
var _ = require('highland')
var casual = require('casual');

var Datastore = require('nedb')
  , users = new Datastore({ filename: 'users', autoload: true })
  , crimes = new Datastore();

var runningPortNumber = Number(process.env.PORT || 5000);

app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));
  app.use(express.urlencoded());

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});

app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});

	next();
});

app.get("/", function(req, res){
  users.find({}, function (err, docs) {
    res.render('index', {error: err, users: docs});
  });
});
app.get("/register", function(req, res){
  users.find({}, function (err, docs) {
    res.render('register', {error: err, users: docs});
  });
});
app.post("/register", function(req, res) {

  var address = req.body.address;

  http.get(address + "/about", function(result) {
    result.on("data", function(chunk) {
      try {

        var json = JSON.parse(chunk.toString());
        users.insert({
          address: address,
          name: json.name,
          avatar: json.avatar,
          city: json.city
        }, function() {
          users.find({}, function (err, docs) {
            res.render('register', {users: docs});
          });
        });

      } catch(e) {
        res.render('register', {error: e.message});
      }
    });
  }).on('error', function(e) {
    res.render('register', {error: e.message});
  });
});

app.get("/about", function(request, response){
  response.json(200, {
    name: 'Example FTW',
    avatar: 'https://1.gravatar.com/avatar/0d40e29bf1ef6d51c9b8e6e7a0edd9f5?d=https%3A%2F%2Fidenticons.github.com%2F25b261712fe40e8558802d1a00745816.png&r=x&s=440',
    city: 'Cardiff' 
  });
});

var computeSolution = function(crime) {
  switch (crime.type) {
    case 'ROBBERY':
      return {
        _id: crime._id,
        action: 'FINE',
        amount: crime.amount * 2 + crime.amount * 0.2
      };
    default: return {};
  }
};

app.post("/broadcast", function(request, response){
  request.on('data', function(chunk) {
    var crime = JSON.parse(chunk.toString());
    var solution = computeSolution(crime);

    console.log(JSON.stringify(crime) + "\n" + JSON.stringify(solution));
    response.json(solution);
  });
});

casual.define('crime_report', function() {
  return {
    criminal: {
      name: casual.name,
      job: casual.title
    },
    type: casual.random_element(['ROBBERY'/*, 'UNPAID', 'MURDER'*/]),
    amount: casual.integer(from = 200, to = 5000),
    location: {
      lat: casual.latitude,
      lng: casual.longitude
    }
  }
});

var isCrimeSolved = function(crime, solution) {
  console.log(JSON.stringify(crime) + "\n" + JSON.stringify(solution));
  switch (crime.type) {
    case 'ROBBERY':
      return solution.action == 'FINE' && (solution.amount == (crime.amount * 2 + crime.amount * 0.2)); break;
    default: return true;
  }
}

setInterval(function() {
  users.find({}, function(err, docs) {
    _(docs).each(function(user) {
      crimes.insert(casual.crime_report, function(error, newCrime) {
        // write data to request body
        req.write(JSON.stringify(newCrime));
        req.end();

        io.sockets.emit('report', require('merge')(
          { user_id: user._id }, newCrime)
        );
      });

      var url = require('url').parse(user.address);
      var options = {
        hostname: url.hostname,
        port: url.port,
        path: '/broadcast',
        method: 'POST'
      };

      var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (solution) {
          var solution = JSON.parse(solution);

          crimes.findOne({ _id: solution._id }, function(error, crime) {
            var total = user.points | 0;

            if (crime && isCrimeSolved(crime, solution)) {
              total++;
              io.sockets.emit('solved', { crime: crime, solution: solution, user: user });
            } else {
              total--;
            }

            users.update({ _id: user._id }, { $set: { points: total }});
            io.sockets.emit('ping', user);
          });
        });
      });

      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

    });
  });
}, 5000);

io.sockets.on('connection', function (socket) {

  io.sockets.emit('blast', {
    msg:"<span style=\"color:red !important\">someone connected</span>"
  });

  socket.on('blast', function(data, fn){
    console.log(data);
    io.sockets.emit('blast', {msg:data.msg});

    fn();//call the client back to clear out the field
  });
});

server.listen(runningPortNumber);
