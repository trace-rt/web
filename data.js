function download()
{
	var data = "text/json;charset=utf-8," + encodeURIComponent(jsonData);
	var dlAnchor = document.createElement("a");
	$(dlAnchor).attr("href", "data:" + data).attr("download", curVehicle + ".json").hide();
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
			{ name: "RPMs",  metric: "engine_speed", mult: .03 },
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
		
		var margin = { top: 20, right: 20, bottom: 20, left: 30 },
			width = Math.max(1000, len * 10) - margin.left - margin.right,
			height = 475 - margin.top - margin.bottom;
		
		var container = $("#graph1");
		// functions we use to display and interact with the graphs and lines
		var graph, x, y, xAxis, yAxis;
		var hoverContainer, hoverLine, hoverLineXOffset, hoverLineYOffset, hoverLineGroup;
		var transitionDuration = 300;
		var margins = [20, 20, 20, 30];
		
		// make sure to use offset() and not position() as we want it relative to the document, not its parent
		hoverLineXOffset = margin.left + container.offset().left;
		hoverLineYOffset = margin.top + container.offset().top;
		
		function redrawAxes(withTransition)
		{
			initY();
			initX();
			
			if(withTransition)
			{
				// slide x-axis to updated location
				graph.selectAll("g .x.axis").transition()
					.duration(transitionDuration)
					.ease("linear")
					.call(xAxis);
			
				// slide y-axis to updated location
				graph.selectAll("g .y.axis").transition()
					.duration(transitionDuration)
					.ease("linear")
					.call(yAxisLeft);
			}
			else
			{
				// slide x-axis to updated location
				graph.selectAll("g .x.axis")
					.call(xAxis);
			
				// slide y-axis to updated location
				graph.selectAll("g .y.axis")
					.call(yAxisLeft);
			}
		}
		
		function redrawLines(withTransition)
		{
			// redraw lines
			if(withTransition)
			{
				graph.selectAll("g .lines path").transition()
					.duration(transitionDuration)
					.ease("linear")
					.attr("d", lineFunction)
					.attr("transform", null);
			}
			else
			{
				graph.selectAll("g .lines path")
					.attr("d", lineFunction)
					.attr("transform", null);
			}
		}
		
		$(container).mouseleave(function(event) { handleMouseOutGraph(event); });
		
		$(container).mousemove(function(event)
			{
				var mouseX = event.pageX - hoverLineXOffset;
				var mouseY = event.pageY - hoverLineYOffset;
				
				//debug("MouseOver graph [" + containerId + "] => x: " + mouseX + " y: " + mouseY + "  height: " + h + " event.clientY: " + event.clientY + " offsetY: " + event.offsetY + " pageY: " + event.pageY + " hoverLineYOffset: " + hoverLineYOffset)
				if(mouseX >= 0 && mouseX <= w && mouseY >= 0 && mouseY <= h)
				{
					// show the hover line
					hoverLine.classed("hide", false);

					// set position of hoverLine
					hoverLine.attr("x1", mouseX).attr("x2", mouseX);
					
					displayValueLabelsForPositionX(mouseX);
					currentUserPositionX = mouseX;
				}
				else
				{
					// proactively act as if we've left the area since we're out of the bounds we want
					handleMouseOutGraph(event)
				}
			});
		
		function handleMouseOutGraph(event)
		{	
			// hide the hover-line
			hoverLine.classed("hide", true);
			
			setValueLabelsToLatest();
			currentUserPositionX = -1;
		}
		
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
			.call(d3.axisLeft(y))
			.selectAll(".tick:last-of-type")
			.append("text")
			.attr("class", "axis-title")
			.attr("x", 3)
			.attr("dy", ".32em")
		
		// add a 'hover' line that we'll show as a user moves their mouse (or finger)
		// so we can use it to show detailed values of each line
		hoverLine = svg.append("g")
			.attr("class", "hover-line")
			.append("svg:line")
			.attr("x1", 10).attr("x2", 10) // vertical line so same value on each
			.attr("y1", 0).attr("y2", height); // top to bottom	
		// hide it by default
		//hoverLine.classed("hide", true);

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