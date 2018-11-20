var polylines = [];
var markers = [];
var apiKey = "AIzaSyBeSqtpRuQhgqSd3_fH1_xBrW0BuD6S6eE";
var pIcon = "resources/p-icon.svg";
var infoWindow;

function drawMap(select, routeKey)
{
	switch(select)
	{
		case 0:
			setMarkers(false);
			hidePolylines();
			heatmapLayer.setMap(null);
			break;
		case 1:
			heatmapLayer.setMap(null);
			runSnapToRoad(rs[routeKey]);
			break;
		case 2:
			setMarkers(false);
			hidePolylines();
			heatmapLayer.setMap(map);
	}
}

// Snap a user-created polyline to roads and draw the snapped path
function runSnapToRoad(path)
{
	var pathValues = [];
	for(var i = 0; i < path.length; i++)
	{
		var p = path[i];
		pathValues.push((new google.maps.LatLng(p.lat, p.lng)).toUrlValue());
	}

	$.get("https://roads.googleapis.com/v1/snapToRoads",
		{
			interpolate: true,
			key: apiKey,
			path: pathValues.join("|")
		}, function(data) { processSnapToRoadResponse(data, path); });
}

// Store snapped polyline returned by the snap-to-road service.
function processSnapToRoadResponse(data, path)
{
	var snappedCoordinates = [];
	for(var i = 0; i < data.snappedPoints.length; i++)
	{
		var latlng = new google.maps.LatLng(data.snappedPoints[i].location.latitude, data.snappedPoints[i].location.longitude);
		snappedCoordinates.push(latlng);
	}
	
	//draw snapped points and lines
	var color = "black";
	var index = 0;
	for(var i = 0; i < snappedCoordinates.length - 1; i++)
	{
		if((index = data.snappedPoints[i].originalIndex))
		{
			color = getSpeedColor(path[index].speed);
		}
		
		var snappedPolyline = new google.maps.Polyline({ path: [snappedCoordinates[i], snappedCoordinates[i + 1]],
			strokeColor: color, strokeWeight: 3, map: map });
		polylines.push(snappedPolyline);
	}
	setMarkers(true, path, snappedCoordinates, data.snappedPoints);
}

//gradient stops: 0-black 30-purple 40-blue 50-green 60-yellow 70-orange 80-red-100
var gradient = [[0, [0, 0, 0]], [30, [255, 0, 255]], [40, [0, 0, 255]], [50, [0, 255, 0]], [60, [255, 255, 0]], [70, [255, 165, 0]],
	[80, [255, 0, 0]], [100, [255, 0, 0]]];
function getSpeedColor(speed_kph)
{
	//convert to MPH
	var speed_mph = Math.min(speed_kph * .621371, 80);
	var colorRange = [];
	$.each(gradient, function(index, value)
		{
			if(speed_mph <= value[0])
			{
				colorRange = [index-1,index]
				return false;
			}
		});
	
	//get the two closest colors
	var color1 = gradient[colorRange[0]][1];
	var color2 = gradient[colorRange[1]][1];
	//calculate ratio between the two closest colors
	var color1X = 100 * (gradient[colorRange[0]][0]/100);
	var color2X = 100 * (gradient[colorRange[1]][0]/100) - color1X;
	var ratio = (speed_mph - color1X) / color2X;
	
	//find color weights
	var w1 = ((ratio * 2 - 1) / 1 + 1) / 2;
	var w2 = 1 - w1;
	var rgb = [Math.round(color2[0] * w1 + color1[0] * w2), Math.round(color2[1] * w1 + color1[1] * w2),
		Math.round(color2[2] * w1 + color1[2] * w2)];
	return "rgb(" + rgb.join() + ")";
}

function hidePolylines()
{
	for(var i = 0; i < polylines.length; i++)
	{
		polylines[i].setMap(null);
	}
	polylines = [];
}

function setMarkers(show, path, snappedPath, data)
{
	if(show)
	{
		if(markers.length == 0)
		{
			var pIconAnchored = { url: pIcon, anchor: new google.maps.Point(9, 9) };
			var lastSnap = 0;
			for(var i = 0; i < path.length; i++)
			{
				var p = path[i];
				for(var j = lastSnap; j < snappedPath.length; j++)
				{
					if(data[j].originalIndex == i)
					{
						lastSnap = j;
						break;
					}
				}
				var marker = new google.maps.Marker({ position: snappedPath[lastSnap], icon: pIconAnchored, opacity: .5, map: map });
				marker.pIndex = i;
				marker.addListener("mouseover", function(e)
					{
						this.setOpacity(1);
						setInfoWindow(true, this);
					});
				marker.addListener("mouseout", function(e)
					{
						this.setOpacity(.5);
						setInfoWindow(false);
					});
				markers.push(marker);
			}
		}
		else
		{
			for(var i = 0; i < markers.length; i++)
			{
				markers[i].setMap(map);
			}
		}
	}
	else
	{
		for(var i = 0; i < markers.length; i++)
		{
			markers[i].setMap(null);
		}
	}
}

function setInfoWindow(show, marker)
{
	if(show)
	{
		var p = rs["route" + curMapRoute][marker.pIndex];
		infoWindow.setContent("Speed: " + p.speed);
		infoWindow.open(map, marker);
	}
	else
	{
		infoWindow.close();
	}
}