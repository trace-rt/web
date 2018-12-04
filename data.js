function download()
{
	var data = "text/json;charset=utf-8," + encodeURIComponent(jsonData);
	var dlAnchor = document.createElement("a");
	$(dlAnchor).attr("href", "data:" + data).attr("download", vs[curVehicle][0] + ".json").hide();
	$("body").append(dlAnchor);
	dlAnchor.click();
	dlAnchor.remove();
}

function drawChart(select, index, metric)
{
	//clear div
	$("#chart").html("").removeClass("inset-shadow");
	$("#chart").css("background-color", "#eee");
	
	switch(select)
	{
		case 0:
			$("#chart").css("overflow-x", "scroll");
			metrics(rs[index][1], metric);
			break;
		case 1:
			$("#chart").css("overflow-x", "auto");
			calendar();
	}
	
	function metrics(input, metric)
	{
		var len = input.length;
		var data = [{ name: "Speed", metric: "vehicle_speed", mult: .621371 },
			{ name: "RPMs",  metric: "engine_speed", mult: .0125 },
			{ name: "Engine Load", metric: "load" },
			{ name: "Intake Pressure", metric: "intake" },
			{ name: "Engine Temp", metric: "temp" }]
			.map(function(m)
			{
				return m.plot = d3.range(len).map(function(t)
				{
					return { x: t, y: (input[t][m.metric] || 0) * (m.mult || 1) };
				}), m;
			});
		
		var margin = { top: 20, right: 20, bottom: 20, left: 40 },
			width = Math.max(1000, len * 10) - margin.left - margin.right,
			height = 475 - margin.top - margin.bottom;
		
		var container = $("#graph1");
		var graph, x, y, xAxis, yAxis;
		var transitionDuration = 300;
		var margins = [20, 20, 20, 40];
		
		var svg = d3.select("#chart").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var x = d3.scaleLinear()
			.domain([0, len - 1])
			.range([0, width]);

		var y = d3.scaleLinear()
			.domain([0, 100])
			.range([height, 0]);
		
		var yAxisRPM = d3.scaleLinear()
			.domain([0, 8000])
			.range([height, 0]);

		var colors = d3.schemeCategory10;

		var line = d3.line()
			.curve(d3.curveBasis)
			.x(function(d) { return x(d.x); })
			.y(function(d) { return y(d.y); });

		svg.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + y(0) + ")")
			.call(d3.axisBottom(x)
			.ticks(len)
			.tickFormat(function(d) { return ((d % Math.round(len / 20)) == 0 ? d + 1 : ""); }));

		svg.append("g")
			.attr("class", "axis axis--y")
			.call(metric == 1 ? d3.axisLeft(yAxisRPM) : d3.axisLeft(y))
			.selectAll(".tick:last-of-type")
			.append("text")
			.attr("class", "axis-title")
			.attr("x", 3)
			.attr("dy", ".32em")
		
		// add the Y gridlines
		function gridlines(n)
		{
			svg.append("g")			
				.attr("class", "grid")
				.call(d3.axisLeft(y).ticks(n).tickSize(-width).tickFormat(""));
		}
		
		if(metric == 1)
		{
			gridlines(4);
		}
		else
		{
			gridlines(5);
		}

		var g = svg.selectAll(".line")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "line");

		g.append("path")
			.attr("d", function(d) { return line(d.plot); })
			.attr("id", function(d, i) { return "path-" + i; })
			.style("stroke", function(d, i) { return colors[i]; })
			.style("opacity", function(d, i) { return (i == metric ? 1 : .3) });

		g.append("text")
			.attr("x", 60)
			.attr("dy", -5)
			.style("fill", function(d, i) { return d3.lab(colors[i]).darker(); })
			.style("opacity", function(d, i) { return (i == metric ? 1 : 0) })
			.append("textPath")
			.attr("class", "textpath")
			.attr("xlink:href", function(d, i) { return "#path-" + i; })
			.text(function(d) { return d.name; });
	}
	
	function calendar()
	{
		$("#chart").html("<iframe src=\"https://calendar.google.com/calendar/embed?src=aot7pfqu9kq8oeg3tln9c3umlc%40group.calendar.google.com&ctz=America%2FChicago\" style=\"border: 0\" width=\"1000\" height=\"494\" frameborder=\"0\" scrolling=\"no\"></iframe>");
	}
}