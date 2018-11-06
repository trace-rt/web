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

function setDataChart()
{
	switch($("#select-chart option:selected").text())
	{
		case "Test":
			$("#select-data-route").show(200);
	}
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

//chart functions
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scaleOrdinal([0, width], .1);

var y = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y).ticks(10, "%");

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tempData = {e: {name: "E", value: 0.12702},
	t: {name: "T", value: 0.09056},
	a: {name: "A", value: 0.08167},
	o: {name: "O", value: 0.07507},
	i: {name: "I", value: 0.06966},
	n: {name: "N", value: 0.06749},
	s: {name: "S", value: 0.06327},
	h: {name: "H", value: 0.06094},
	r: {name: "R", value: 0.05987},
	d: {name: "D", value: 0.04253},
	l: {name: "L", value: 0.04025},
	c: {name: "C", value: 0.02782},
	u: {name: "U", value: 0.02758},
	m: {name: "M", value: 0.02406},
	w: {name: "W", value: 0.0236},
	f: {name: "F", value: 0.02288},
	g: {name: "G", value: 0.02015},
	y: {name: "Y", value: 0.01974},
	p: {name: "P", value: 0.01929},
	b: {name: "B", value: 0.01492},
	v: {name: "V", value: 0.00978},
	k: {name: "K", value: 0.00772},
	j: {name: "J", value: 0.00153},
	x: {name: "X", value: 0.0015},
	q: {name: "Q", value: 0.00095},
	z: {name: "Z", value: 0.00074}};

$.each(tempData, function(i, d)
	{
	  x.domain(d3.map(function(d) { return d.name; }));
	  y.domain([0, d3.max(tempData, function(d) { return d.value; })]);

	  chart.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);

	  chart.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	  .append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Frequency");

	  chart.selectAll(".bar")
		  .data(tempData)
		.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", function(d) { return x(d.name); })
		  .attr("y", function(d) { return y(d.value); })
		  .attr("height", function(d) { return height - y(d.value); })
		  .attr("width", x.range);
	});

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