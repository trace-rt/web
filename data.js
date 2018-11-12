var rs  = [];
var margin = { top: 20, right: 20, bottom: 20, left: 20 },
		width = 1000 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

function setRoutes(routes)
{
	rs = routes;
}

function drawChart(select, rKey)
{
	//clear div
	$(".chart").html("");
	
	var svg = d3.select(".chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	switch(select)
	{
		case 0:
			metrics();
			break;
		case 1:
			colorTest();
	}
	
	function metrics()
	{
		var data = [{ name: "Speed", labelOffset: 20, value: function(t) { return rs[rKey][t].speed || 0; }},
			{ name: "RPMs", labelOffset: 40, value: function(t) { return rs[rKey][t].rpm || 0; }},
			{ name: "Engine Load", labelOffset: 60, value: function(t) { return rs[rKey][t].load || 0; }},
			{ name: "Intake Pressure", labelOffset: 80, value: function(t) { return rs[rKey][t].intake || 0; }},
			{ name: "Engine Temp", labelOffset: 100, value: function(t) { return rs[rKey][t].temp || 0; }}];
		
		var x = d3.scaleLinear()
			.domain([0, rs[rKey].length])
			.range([0, width]);

		var y = d3.scaleLinear()
			.domain([0, 100])
			.range([height, 0]);

		var colors = d3.schemeCategory10;

		var line = d3.line()
			.curve(d3.curveBasis)
			.x(function(d) { return x(d.input); })
			.y(function(d) { return y(d.delta); });

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
			.data(data1)
			.enter()
			.append("g")
			.attr("class", "line");

		g.append("path")
			.attr("d", function(d) { return line(d.deltas); })
			.attr("id", function(d, i) { return "path-" + i; })
			.style("stroke", function(d, i) { return colors[i]; });

		g.append("text")
			.attr("x", function(d) { return d.labelOffset; })
			.attr("dy", -5)
			.style("fill", function(d, i) { return d3.lab(z[i]).darker(); })
			.append("textPath")
			.attr("class", "textpath")
			.attr("xlink:href", function(d, i) { return "#path-" + i; })
			.text(function(d) { return d.name; });
	}
	
	function colorTest()
	{
		
		var data = [{name: "HSL Rainbow", labelOffset: 60, value: function(t) { return d3.hsl(t, 1, 0.5); }},
			{name: "HCL Rainbow", labelOffset: 20, value: function(t) { return d3.hcl(t, 1, 0.5); }},
			{name: "Colors", labelOffset: 40, value: d3.scaleSequential(d3.interpolatePiYG)}].map(function(color)
			{
				return color.deltas = d3.range(0, 360, 3).map(function(x)
				{
					return { input: x, delta: delta(color.value(x - 10), color.value(x + 10)) };
				}), color;
			});
		
		var x = d3.scaleLinear()
			.domain([0, 360])
			.range([0, width]);

		var y = d3.scaleLinear()
			.domain([0, 80])
			.range([height, 0]);

		var z = d3.schemeCategory10;

		var line = d3.line()
			.curve(d3.curveBasis)
			.x(function(d) { return x(d.input); })
			.y(function(d) { return y(d.delta); });

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
			.data(data1)
			.enter()
			.append("g")
			.attr("class", "line");

		g.append("path")
			.attr("d", function(d) { return line(d.deltas); })
			.attr("id", function(d, i) { return "path-" + i; })
			.style("stroke", function(d, i) { return z[i]; });

		g.append("text")
			.attr("x", function(d) { return d.labelOffset; })
			.attr("dy", -5)
			.style("fill", function(d, i) { return d3.lab(z[i]).darker(); })
			.append("textPath")
			.attr("class", "textpath")
			.attr("xlink:href", function(d, i) { return "#path-" + i; })
			.text(function(d) { return d.name; });

		// CIE76 per https://en.wikipedia.org/wiki/Color_difference#CIE76
		// Not as good as CIEDE2000 but a lot easier to implement.
		function delta(a, b)
		{
			var dl = (a = d3.lab(a)).l - (b = d3.lab(b)).l, da = a.a - b.a, db = a.b - b.b;
			return Math.sqrt(dl * dl + da * da + db * db);
		}
	}
}