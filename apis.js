//Firebase
var config = {
	apiKey: "AIzaSyC0ORRsYb0e3H-I2IAz-qBbgqInm-Ra3sI",
	authDomain: "vehicle-blackbox.firebaseapp.com",
	databaseURL: "https://vehicle-blackbox.firebaseio.com",
	projectId: "vehicle-blackbox",
	storageBucket: "vehicle-blackbox.appspot.com",
	messagingSenderId: "1033879747763"
};
firebase.initializeApp(config);

//Google SignIn
var googleUser = {};
var startApp = function()
	{
		gapi.load("auth2", function()
		{
			// Retrieve the singleton for the GoogleAuth library and set up the client.
			auth2 = gapi.auth2.init({ client_id: "618088048289-6ojbgiu7u1pc0vl0rkh04kes8mb6ijh8.apps.googleusercontent.com",
			cookiepolicy: "single_host_origin",
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
function initMap()
{
	map = new google.maps.Map(document.getElementById("map"), { center: { lat: 30.61, lng: -96.35 }, zoom: 13 });
	initPlacesUI();
	infoWindow = new google.maps.InfoWindow;

	// Try HTML5 geolocation.
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(function(position)
			{
				var pos = { lat: position.coords.latitude, lng: position.coords.longitude };

				infoWindow.setPosition(pos);
				infoWindow.setContent("Location found.");
				infoWindow.open(map);
				map.setCenter(pos);
			}, function() { handleLocationError(true, infoWindow, map.getCenter()); });
	}
	else
	{
		// Browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}
}

function handleLocationError(browserHasGeolocation, infoWindow, pos)
{
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn\'t support geolocation.");
	infoWindow.open(map);
}

//Snap to Roads test
// Adds a Places search box. Searching for a place will center the map on that
// location.
function initPlacesUI()
{
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById("gmol-bar"));
	var autocomplete = new google.maps.places.Autocomplete(document.getElementById("gmol-autoc"));
	autocomplete.bindTo("bounds", map);
	autocomplete.addListener("place_changed", function()
		{
			var place = autocomplete.getPlace();
			if(place.geometry.viewport)
			{
				map.fitBounds(place.geometry.viewport);
			}
			else
			{
				map.setCenter(place.geometry.location);
				map.setZoom(17);
			}
		});
}