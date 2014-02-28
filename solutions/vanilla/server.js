var http = require('http');

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

var server = http.createServer(function(req, res) {

  if (req.method == 'GET') {
    if (req.url.match('^/about')) {

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        name: "YOUR_TEAM_NAME",
        avatar: "AVATAR_URL",
        city: "CITY_NAME"
      }));
    }
  } else {
    if (req.url.match('^/broadcast')) {
      req.on('data', function(chunk) {

        var crime = JSON.parse(chunk.toString());
        var solution = {}; //computeSolution(crime);

        res.writeHead(200, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(solution));
      });
    }
  }
});

server.listen(5000);
