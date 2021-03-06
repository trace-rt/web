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
function startApp()
{
	gapi.load("auth2", function()
		{
			//retrieve the singleton for the GoogleAuth library and set up the client
			auth2 = gapi.auth2.init({ client_id: "618088048289-6ojbgiu7u1pc0vl0rkh04kes8mb6ijh8.apps.googleusercontent.com",
				cookiepolicy: "single_host_origin" });
		});
	
	var provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope("https://www.googleapis.com/auth/calendar");
	firebase.auth().signInWithPopup(provider).then(function(result)
		{
			//Google access token
			var token = result.credential.accessToken;
			var user = result.user;
			//console.log(user, token);
		}).catch(function(error)
		{
			//handle Errors here
			console.log("Invalid login credentials.\n\nError Code: " + error.code + "\nMessage: " + error.message + "\nEmail: " + error.email +
				"\nAuth Credential: " + error.credential);
		});
	
	onSignIn();
};

//Google Maps
var map, infoWindow;
function initMap()
{
	map = new google.maps.Map(document.getElementById("map"), { center: { lat: 30.61, lng: -96.35 }, zoom: 13 });
	initPlacesUI();

	// Try HTML5 geolocation.
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(function(position)
			{
				var pos = { lat: position.coords.latitude, lng: position.coords.longitude };
				map.setCenter(pos);
			}, function() { handleLocationError(true); });
	}
	else
	{
		// Browser doesn't support Geolocation
		handleLocationError(false);
	}
}

function handleLocationError(browserHasGeolocation)
{
	consol.log(browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn\'t support geolocation.");
}

//Google Places search box
function initPlacesUI()
{
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById("gmol-bar"));
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