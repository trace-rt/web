var margin = { top: 20, right: 20, bottom: 20, left: 20 },
	width = 1000 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

function drawChart(select, routeKey)
{
	//clear div
	$(".chart").html("");
	
	switch(select)
	{
		case 0:
			metrics(routeKey);
			break;
		case 1:
			calendar();
	}
	
	function metrics(rKey)
	{
		var len = rs[rKey].length;
		var intp = d3.scaleSequential(d3.interpolatePiYG);
		var data = [{ name: "Speed", labelOffset: 20, metric: "speed", value: intp },
			{ name: "RPMs", labelOffset: 40, metric: "rpm", value: intp },
			{ name: "Engine Load", labelOffset: 60, metric: "load", value: intp },
			{ name: "Intake Pressure", labelOffset: 80, metric: "intake", value: intp },
			{ name: "Engine Temp", labelOffset: 100, metric: "temp", value: intp }]
			.map(function(m)
			{
				return m.plot = d3.range(len).map(function(t)
				{
					return { x: t, y: rs[rKey][t][m.metric] || 0 }
				}), m;
			});
			
		var svg = d3.select(".chart").append("svg")
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

		var colors = d3.schemeCategory10;

		var line = d3.line()
			.curve(d3.curveBasis)
			.x(function(d) { return x(d.x); })
			.y(function(d) { return y(d.y); });

		svg.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + y(0) + ")")
			.call(d3.axisBottom(x));

		svg.append("g")
			.attr("class", "axis axis--y")
			.call(d3.axisLeft(y))
			.selectAll(".tick:last-of-type")
			.append("text")
			.attr("class", "axis-title")
			.attr("x", 3)
			.attr("dy", ".32em")
			.text("Color Difference at ±10° (CIE76)");

		var g = svg.selectAll(".line")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "line");

		g.append("path")
			.attr("d", function(d) { return line(d.plot); })
			.attr("id", function(d, i) { return "path-" + i; })
			.style("stroke", function(d, i) { return colors[i]; });

		g.append("text")
			.attr("x", function(d) { return d.labelOffset; })
			.attr("dy", -5)
			.style("fill", function(d, i) { return d3.lab(colors[i]).darker(); })
			.append("textPath")
			.attr("class", "textpath")
			.attr("xlink:href", function(d, i) { return "#path-" + i; })
			.text(function(d) { return d.name; });
	}
	
	function calendar()
	{
		$(".chart").html("<iframe src=\"https://calendar.google.com/calendar/embed?src=aot7pfqu9kq8oeg3tln9c3umlc%40group.calendar.google.com&ctz=America%2FChicago\" style=\"border: 0\" width=\"1000\" height=\"500\" frameborder=\"0\" scrolling=\"no\"></iframe>");
	}
}