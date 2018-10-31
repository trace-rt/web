//dynamic page content
var dest = "";
var routes = []
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
	});

//page event callbacks
function googleAPIReady()
{
	populateHeatmap(firebase.database().ref("/vehicles/_TEST_"));
	heatmapLayer = new google.maps.visualization.HeatmapLayer({ data: heatmap, map: map });
	heatmapLayer.setMap(null);
}

function setMapOverlay()
{
	switch($("#select-overlay option:selected").text())
	{
		case "None":
			$("#select-route").hide(200);
			heatmapLayer.setMap(null);
			break;
		case "Route":
			$("#select-route").show(200);
			heatmapLayer.setMap(null);
			break;
		case "Heatmap":
			$("#select-route").hide(200);
			heatmapLayer.setMap(map);
	}
}

function setMapRoute()
{
	//TEMP use array index of option value for selecting route data
}

//overlay functions
function populateHeatmap(vehicleRef)
{
	vehicleRef.once("value", function(snap)
		{
			snap.forEach(function(routeSnap)
				{
					var rKey = routeSnap.key;
					if(rKey == "info") return;
					
					var route = { key: rKey, ps: [] };
					routeSnap.forEach(function(pSnap)
						{
							p = pSnap.val();
							route.ps.push(p);
							var temp = new google.maps.LatLng(p.lat, p.lng)
							heatmap.push(temp);
							console.log("lat", p.lat);
							console.log("lng", p.lng);
							console.log("gmLatLng", temp);
						})
					routes.push(route);
					
					$("#select-route").append("<option>" + route.key + "</option>");
				})
		});
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
