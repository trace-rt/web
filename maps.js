var drawingManager;
var placeIdArray = [];
var polylines = [];
var snappedCoordinates = [];
var apiKey = "AIzaSyBeSqtpRuQhgqSd3_fH1_xBrW0BuD6S6eE";

function drawMap(select, routeKey)
{
	switch(select)
	{
		case 0:
			heatmapLayer.setMap(null);
			break;
		case 1:
			heatmapLayer.setMap(null);
			runSnapToRoad(rs[routeKey]);
			break;
		case 2:
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
		}, function(data)
		{
			processSnapToRoadResponse(data);
			drawSnappedPolyline();
			getAndDrawSpeedLimits();
		});
}

// Store snapped polyline returned by the snap-to-road service.
function processSnapToRoadResponse(data)
{
	snappedCoordinates = [];
	placeIdArray = [];
	for(var i = 0; i < data.snappedPoints.length; i++)
	{
		var latlng = new google.maps.LatLng(data.snappedPoints[i].location.latitude, data.snappedPoints[i].location.longitude);
		snappedCoordinates.push(latlng);
		placeIdArray.push(data.snappedPoints[i].placeId);
	}
}

// Draws the snapped polyline (after processing snap-to-road response).
function drawSnappedPolyline()
{
	var snappedPolyline = new google.maps.Polyline({ path: snappedCoordinates, strokeColor: "black", strokeWeight: 3 });
	snappedPolyline.setMap(map);
	polylines.push(snappedPolyline);
}

// Gets speed limits (for 100 segments at a time) and draws a polyline
// color-coded by speed limit. Must be called after processing snap-to-road
// response.
function getAndDrawSpeedLimits()
{
	for(var i = 0; i <= placeIdArray.length / 100; i++)
	{
		// Ensure that no query exceeds the max 100 placeID limit.
		var start = i * 100;
		var end = Math.min((i + 1) * 100 - 1, placeIdArray.length);

		drawSpeedLimits(start, end);
	}
}

// Gets speed limits for a 100-segment path and draws a polyline color-coded by
// speed limit. Must be called after processing snap-to-road response.
function drawSpeedLimits(start, end)
{
	var placeIdQuery = "";
	for(var i = start; i < end; i++)
	{
		placeIdQuery += "&placeId=" + placeIdArray[i];
	}

	$.get("https://roads.googleapis.com/v1/speedLimits",
		"key=" + apiKey + placeIdQuery,
		function(speedData)
		{
			processSpeedLimitResponse(speedData, start);
		});
}

// Draw a polyline segment (up to 100 road segments) color-coded by speed limit.
function processSpeedLimitResponse(speedData, start)
{
	var end = start + speedData.speedLimits.length;
	for(var i = 0; i < speedData.speedLimits.length - 1; i++)
	{
		var speedLimit = speedData.speedLimits[i].speedLimit;
		var color = getColorForSpeed(speedLimit);

		// Take two points for a single-segment polyline.
		var coords = snappedCoordinates.slice(start + i, start + i + 2);

		var snappedPolyline = new google.maps.Polyline({ path: coords, strokeColor: color, strokeWeight: 6 });
		snappedPolyline.setMap(map);
		polylines.push(snappedPolyline);
	}
}

function getColorForSpeed(speed_kph)
{
	var speed_mph = speed_kph * .621371;
	if(speed_mph < 35) { return "purple"; }
	if(speed_mph <= 40) { return "blue"; }
	if(speed_mph <= 50) { return "green"; }
	if(speed_mph <= 60) { return "yellow"; }
	if(speed_mph <= 70) { return "orange"; }
	return "red";
}