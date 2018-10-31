//dynamic page content
var dest = "";
var heatmap = [];
var map, heatmapLayer;

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
		populateHeatmap(firebase.database().ref("/vehicles/_TEST_"));
		heatmapLayer = new google.maps.visualization.HeatmapLayer({ data: heatmap, map: map });
		heatmap.setMap(null);
	});

//page event callbacks

function setMapOverlay()
{
	switch($("#select-overlay option:selected").text())
	{
		case "None":
			$("#select-route").hide(200);
			heatmap.setMap(null);
			break;
		case "Route":
			$("#select-route").show(200);
			heatmap.setMap(null);
			break;
		case "Heatmap":
			$("#select-route").hide(200);
			heatmap.setMap(map);
	}
}

function setMapRoute()
{
	//TEMP use array index of option value for selecting route data
}

//overlay functions
function populateHeatmap(vehicleRef)
{
	vehicleRef.once("value", function (snap)
		{
			snap.forEach(function (routeSnap)
				{
					routeSnap.forEach(function (pSnap)
						{
							console.log("lat", pSnap.val());
							console.log("lng", pSnap.val());
						})})});
	//heatmap.push(new google.maps.LatLng(37.782551, -122.445368));

	var temp = [30.6123, -96.3351, 30.6138, -96.3342, 30.6142, -96.3328];
	for(var i = 0; i < 3; i++)
	{
		heatmap.push(new google.maps.LatLng(temp[i * 2], temp[i * 2 + 1]));
	}
}

//UI guide
/*var bodyRect = 0, // document.body.getBoundingClientRect(),
	elemRect = 0, // element.getBoundingClientRect(),
	offset = 0; // {elemRect.top - bodyRect.top, elemRect.left - bodyRect.left};

var line = $('#line');
var div1 = $('#one');
var div2 = $('#two');

var x1 = div1.offset().left + (div1.width()/2);
var y1 = div1.offset().top + (div1.height()/2);
var x2 = div2.offset().left + (div2.width()/2);
var y2 = div2.offset().top + (div2.height()/2);

line.attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2);*/