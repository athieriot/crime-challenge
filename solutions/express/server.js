var express = require("express");

var app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(__dirname + "/public")); //use static files in ROOT/public folder
app.use(app.router); //use both root and other routes below

app.use(function(req, res, next){
	console.log({method:req.method, url: req.url, device: req.device});
	next();
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

app.listen(process.env.PORT);
