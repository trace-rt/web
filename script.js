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
	});

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
  attachSignin(document.getElementById('customBtn'));
});
};

function attachSignin(element) {
console.log(element.id);
auth2.attachClickHandler(element, {},
	function(googleUser) {
	  document.getElementById('name').innerText = "Signed in: " +
		  googleUser.getBasicProfile().getName();
	}, function(error) {
	  alert(JSON.stringify(error, undefined, 2));
	});
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