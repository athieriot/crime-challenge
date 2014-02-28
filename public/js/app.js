// connect to our socket server
var socket = io.connect('/');
var app = app || {};

var map = [];
var markers = [];

$(function(){

  $('.usermap').each(function(i, element) {
    GMaps.geocode({
      address: $(element).data('city'),
      callback: function(results, status) {
        if (status == 'OK') {
          var latlng = results[0].geometry.location;
          map[$(element).data('id')] = new GMaps({
            div: $(element).attr('id'),
            lat: latlng.lat(),
            lng: latlng.lng(),
            zoom: 1,
            width: "700px",
            height: "300px"
          });
        }
      }
    });
  });

	//SOCKET STUFF
	socket.on("ping", function(data) {
    $('#' + data._id).find('.alert').show();
    $('#' + data._id).find('.points').text(data.points);
    window.setTimeout(function() {
      $('#' + data._id).find('.alert').hide();
    }, 1000);
	});

  socket.on("report", function(data) {
    if (!markers[data.user_id]) markers[data.user_id] = [];
    markers[data.user_id][data._id] = map[data.user_id].addMarker({
      lat: data.location.lat,
      lng: data.location.lng,
      title: data.type,
      infoWindow: {
        content: data.type
      },
      icon: '/img/gun.gif'
    });
  });

  socket.on("solved", function(data) {
    markers[data.user._id][data.crime._id].setIcon('/img/ok.png');
  });
});
