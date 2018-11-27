var page = "";
var jsonData = "";
var vs  = [];
var rs = [];
var heatmap = [];
var map, routeLayer, heatmapLayer;
var curVehicle, curMapRoute, curDataRoute;

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
		pullVehicles(firebase.database().ref("/vehicles"));
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
	infoWindow = new google.maps.InfoWindow;
	heatmapLayer = new google.maps.visualization.HeatmapLayer({ data: heatmap, map: map });
	heatmapLayer.setMap(null);
}

function pullVehicles(dbRef)
{
	dbRef.once("value", function(snap)
		{
			snap.forEach(function(vehicleSnap)
			{
				var vKey = vehicleSnap.key;
				vs.push(vKey);
				$("#select-vehicle").append("<option>" + vKey + "</option>");
			});
			
			$("#select-vehicle").prop("selectedIndex", 1);
			setVehicle();
		});
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
				if(rKey == "info") return;
				
				rs[rKey] = [];
				routeSnap.forEach(function(pSnap)
				{
					p = pSnap.val();
					rs[rKey].push(p);
					heatmap.push(new google.maps.LatLng(p.lat, p.lng));
				})
				
				$("#select-maps-route").append("<option>" + rKey + "</option>");
				$("#select-data-route").append("<option>" + rKey + "</option>");
			})
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
	
	curVehicle = $("#select-vehicle option:selected").text();
	pullData(firebase.database().ref("/vehicles/" + curVehicle));
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
			if(curMapRoute != undefined) drawMap(1, "route" + curMapRoute);
			break;
		case "Heatmap":
			$("#select-maps-route").hide(200);
			drawMap(2);
	}
}

function setMapRoute()
{
	markers = [];
	curMapRoute = $("#select-maps option:selected").index() - 1;
	drawMap(1, "route" + curMapRoute);
}

//chart functions
function setDataChart()
{
	switch($("#select-data option:selected").text())
	{
		case "Route Metrics":
			$("#select-data-route").show(200);
			if(curDataRoute != undefined) drawChart(0, "route" + curDataRoute);
			break;
		case "Calendar":
			$("#select-data-route").hide(200);
			drawChart(1);
	}
}

function setDataRoute()
{
	curDataRoute = $("#select-data option:selected").index();
	drawChart(0, "route" + curDataRoute);
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

//background animation
/*(function ($, window)
{
	function Pattern(canvas, options)
	{
		var $canvas = $(canvas),
			context = canvas.getContext("2d"),
			img = new Image(),
			defaults = {
				chev: {
					color: "rgba(255, 255, 255, .5)",
					width: 1
				},
				position: {
					x: canvas.width * 1,
					y: canvas.height * 0.5
				},
				width: window.innerWidth,
				height: window.innerHeight,
				velocity: 0.4,
				length: 60,
				distance: 200,
				radius: 150,
				chevs: []
			},
			config = $.extend(true, {}, defaults, options);

		function Chevron()
		{
			this.x = Math.random() * (canvas.width + 200) - 100;
			this.y = Math.random() * (canvas.height + 200) - 100;
			this.z = Math.random() * 100;
		}

		Chevron.prototype = {
			create: function()
			{
				context.drawImage(img, this.position.x, this.position.y);
			},

			animate: function()
			{
				for(var i = 0; i < config.length; i++)
				{
					var chev = config.chevs[i];

					if(chev.y > canvas.height + 100)
					{
						chev.y = -100;
					}
					
					chev.y += config.velocity;
				}
			}
		};

		this.createChevs = function()
		{
			var length = config.length, chev, i;
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			for(i = 0; i < length; i++)
			{
				config.chevs.push(new Chevron());
				chev = config.chevs[i];
				chev.create();
			}
			chev.animate();
		};

		this.setCanvas = function()
		{
			canvas.width = $("#canL").width();
			canvas.height = config.height;
		};

		this.loop = function(callback)
		{
			callback();
			window.requestAnimationFrame(function() { this.loop(callback); }.bind(this));
		};

		this.bind = function()
		{
			$(window).on('mousemove', function(e)
			{
				config.position.x = e.pageX - $canvas.offset().left;
				config.position.y = e.pageY - $canvas.offset().top;
			});
		};

		this.init = function()
		{
			this.setCanvas();
			this.img.src = "resources/chevron.svg";
			this.loop(this.createChevs);
			this.bind();
		};
	}

	$.fn.initBG = function(options)
	{
		return this.each(function()
		{
			var c = new Pattern(this, options);
			c.init();
		});
	};
})
($, window);
$("#canL").initBG(
	{
		chev: {
			width: 1
		},
		radius: 350
	});*/