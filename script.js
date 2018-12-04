var page = "";
var jsonData = "";
var vs, rs;
var heatmap = [];
var map, routeLayer, heatmapLayer;
var curVehicle, curMapRoute, curDataRoute, curDataMetric = 0;

//dynamic page content
function fadeBegin()
{
	$(page).hide().css("visibility", "visible").fadeIn(200);
	$("nav").attr("class", "nav-" + page.substring(1));
}

$(document).ready(function()
	{
		$("nav a").click(function()
		{
			page = $(this).attr("href");
			$("content").fadeOut(200, fadeBegin).css("visibility", "hidden");
			return false;  
		});
		
		$("#select-maps-route").hide();
		$("#data-dl").show();
	});

window.onload = function()
	{
		initMap();
		googleAPIReady();
	}

//page event callbacks
function googleAPIReady()
{
	startApp();
	infoWindow = new google.maps.InfoWindow;
	heatmapLayer = new google.maps.visualization.HeatmapLayer({ data: [], map: null });
}

function onSignIn()
{
	pullVehicles(firebase.database().ref("/vehicles"));
}

function pullVehicles(dbRef)
{
	$("#select-vehicle").html("")
	vs = [];
	dbRef.once("value", function(snap)
		{
			snap.forEach(function(vehicleSnap)
			{
				var vKey = vehicleSnap.key;
				var v = vehicleSnap.val();
				vs.push([vKey, v]);
				$("#select-vehicle").append("<option>" + v.info.year + " " + v.info.make + " " + v.info.model + "</option>");
			});
			
			$("#select-vehicle").prop("selectedIndex", 1);
			setVehicle();
		});
	if(vs.length == 0)
	{
		$("#select-vehicle").append("<option selected disabled>No Vehicle Data Available</option>");
	}
	$("#select-data-metric option").each(function(){ $(this).prop("disabled", true); });
}

function pullData(vehicleRef)
{
	rs = [];
	heatmap = [];
	vehicleRef.once("value", function(snap)
		{
			snap.forEach(function(routeSnap)
			{
				//name of DB directory
				var rKey = routeSnap.key;
				
				var ps = [];
				routeSnap.forEach(function(pSnap)
				{
					var p = pSnap.val();
					ps.push(p);
					heatmap.push(new google.maps.LatLng(p.latitude, p.longitude));
				});
				rs.push([rKey, ps]);
				
				var rName = (ps.length > 0 && ps[0].time != undefined ? (new Date(ps[0].timestamp)).toLocaleString() : rKey);
				$("#select-maps-route").append("<option>" + rName + "</option>");
				$("#select-data-route").append("<option>" + rName + "</option>");
			});
			jsonData = JSON.stringify(snap);
		});
}

function setVehicle()
{
	$("#select-maps-route").html("<option selected disabled>Choose a recorded route</option>");
	$("#select-data-route").html("<option selected disabled>Choose a recorded route</option>");
	$("#select-maps").prop("selectedIndex", 0);
	setMapOverlay();
	curMapRoute = undefined;
	
	curVehicle = $("#select-vehicle option:selected").index() - 1;
	pullData(firebase.database().ref("/vehicles/" + vs[curVehicle][0] + "/routes/"));
}

//overlay functions
function setMapOverlay()
{
	switch($("#select-maps option:selected").text())
	{
		case "None":
			$("#select-maps-route").hide(200);
			drawMap(0);
			break;
		case "Route":
			$("#select-maps-route").show(200);
			if(curMapRoute != undefined) drawMap(1, curMapRoute);
			break;
		case "Heatmap":
			$("#select-maps-route").hide(200);
			drawMap(2);
	}
}

function setMapRoute()
{
	markers = [];
	curMapRoute = $("#select-maps-route option:selected").index() - 1;
	drawMap(1, curMapRoute);
}

//chart functions
function setDataChart()
{
	switch($("#select-data option:selected").text())
	{
		case "Route Metrics":
			$("#select-data-route").show(200);
			$("#select-data-metric").show(200);
			if(curDataRoute != undefined) drawChart(0, curDataRoute);
			break;
		case "Calendar":
			$("#select-data-route").hide(200);
			$("#select-data-metric").hide(200);
			drawChart(1);
	}
}

function setDataRoute()
{
	curDataRoute = $("#select-data-route option:selected").index() - 1;
	$("#select-data-metric option").each(function(i){ $(this).prop("disabled", false); });
	drawChart(0, curDataRoute, curDataMetric);
}

function setDataMetric()
{
	curDataMetric = $("#select-data-metric option:selected").index();
	drawChart(0, curDataRoute, curDataMetric);
}