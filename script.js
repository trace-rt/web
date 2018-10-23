//dynamic page content
var dest = "";
function fadeBegin()
{
	$(dest).hide().css("visibility", "visible").fadeIn(200);
	$("nav").attr("class", "nav-" + dest.substring(1));
}

$(document).ready(function()
	{
		$("nav a").click(function()
			{
				dest = $(this).attr("href");
				$("content").fadeOut(200, fadeBegin).css("visibility", "hidden");
				return false;  
			});
		
		$("#select-route").hide();
	});

//page event callbacks
function setMapOverlay()
{
	switch($("#select-overlay option:selected").text())
	{
		case "None":
			$("#select-route").hide(200);
			break;
		case "Route":
			$("#select-route").show(200);
			break;
		case "Heatmap":
			$("#select-route").hide(200);
	}
}

function setMapRoute()
{
	//TEMP use array index of option value for selecting route data
}

//UI guide
var bodyRect = 0, // document.body.getBoundingClientRect(),
	elemRect = 0, // element.getBoundingClientRect(),
	offset = 0; // {elemRect.top - bodyRect.top, elemRect.left - bodyRect.left};

var line = $('#line');
var div1 = $('#one');
var div2 = $('#two');

var x1 = div1.offset().left + (div1.width()/2);
var y1 = div1.offset().top + (div1.height()/2);
var x2 = div2.offset().left + (div2.width()/2);
var y2 = div2.offset().top + (div2.height()/2);

line.attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2);



//Firebase
 var config = {
    apiKey: "AIzaSyC0ORRsYb0e3H-I2IAz-qBbgqInm-Ra3sI",
    authDomain: "vehicle-blackbox.firebaseapp.com",
    databaseURL: "https://vehicle-blackbox.firebaseio.com",
    projectId: "vehicle-blackbox",
    storageBucket: "vehicle-blackbox.appspot.com",
    messagingSenderId: "1033879747763"
  };
  //firebase.initializeApp(config);

//Google SignIn
var googleUser = {};
var startApp = function() {
gapi.load('auth2', function(){
  // Retrieve the singleton for the GoogleAuth library and set up the client.
  auth2 = gapi.auth2.init({
	client_id: '618088048289-6ojbgiu7u1pc0vl0rkh04kes8mb6ijh8.apps.googleusercontent.com',
	cookiepolicy: 'single_host_origin',
	// Request scopes in addition to 'profile' and 'email'
	//scope: 'additional_scope'
  });
});
};

function onSignIn()
{
}

//Google Maps
// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map, infoWindow;
function initMap() {
map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 30.61, lng: -96.35},
  zoom: 13
});
infoWindow = new google.maps.InfoWindow;

// Try HTML5 geolocation.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
	var pos = {
	  lat: position.coords.latitude,
	  lng: position.coords.longitude
	};

	infoWindow.setPosition(pos);
	infoWindow.setContent('Location found.');
	infoWindow.open(map);
	map.setCenter(pos);
  }, function() {
	handleLocationError(true, infoWindow, map.getCenter());
  });
} else {
  // Browser doesn't support Geolocation
  handleLocationError(false, infoWindow, map.getCenter());
}
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
infoWindow.setPosition(pos);
infoWindow.setContent(browserHasGeolocation ?
					  'Error: The Geolocation service failed.' :
					  'Error: Your browser doesn\'t support geolocation.');
infoWindow.open(map);
}