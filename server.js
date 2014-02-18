var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var device  = require('express-device');

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'datafile', autoload: true });

var runningPortNumber = process.env.PORT;

app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));
  app.use(express.urlencoded());

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});

// logs every request
app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});

	next();
});

app.get("/", function(req, res){ res.render('index', {}); });
app.get("/register", function(req, res){

  db.find({ type: 'user' }, function (err, docs) {
    res.render('register', {error: err, users: docs});
  });
});
app.post("/register", function(req, res) {

  var address = req.body.address;

  http.get(address + "/about", function(res) {
    db.insert({
      type: 'user',
      address: address,
      name: res.name,
      avatar: res.avatar,
      city: res.city
    });

    db.find({ type: 'user' }, function (err, docs) {
      res.render('register', {users: docs});
    });
  }).on('error', function(e) {
    res.render('register', {error: e.message});
  });
});

io.sockets.on('connection', function (socket) {

	io.sockets.emit('blast', {msg:"<span style=\"color:red !important\">someone connected</span>"});

	socket.on('blast', function(data, fn){
		console.log(data);
		io.sockets.emit('blast', {msg:data.msg});

		fn();//call the client back to clear out the field
	});
});


server.listen(runningPortNumber);
