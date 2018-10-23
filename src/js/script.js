var requests = false;
var timeout;
var weatherapikey = false;
var controlOutlets = function(btn, off) {
	$.ajaxQueue({
		'url': 'php/status.php',
		'data': {
			action: btn.attr('data-actiontype'),
			turnoff: off,
			outlets: (btn.attr('data-outlets')).split(',')
		}
	}).done(function(data){
		if(requests) requests.abort();
		queryOutletStatus();
	});
};
var updateWeatherFirstTime = function() {
	$.ajax({
		url: 'php/apikey.php',
		success: function(data) {
			weatherapikey = data;
			updateWeather();
		},
		timeout: 1000,
		error: function(jqXHR, textStatus, errorThrown) {
			console.warn("Status JSON returned error: " + errorThrown);
		}
	});
}

// Don't get the PHP engine involved for querying the outlet status. This will
// lessen the load on the Raspberry Pi.
var queryOutletStatus = function() {
	requests = $.ajax({
		url: 'php/status.json?nocache=' + (new Date()).getTime(),
		success: function(data) {
			updateUI(data);
		},
		timeout: 1750,
		error: function(jqXHR, textStatus, errorThrown) {
			console.warn("Status JSON returned error: " + errorThrown);
		}
	});
};

var updateUI = function(data) {
	Object.keys(data.outlets).forEach(function (outlet) {
		$("button[data-outlets=" + outlet + "]").attr("data-status", (data.outlets[outlet] ? "on" : "off"));
	});

	Object.keys(data.rooms).forEach(function (outlet) {
		$(".room[data-outlets=" + outlet + "]").attr("data-status", (data.rooms[outlet] ? "on" : "off"));
	});
};

var refreshClock = function() {
	$('.clock__time').html(moment().format('h:mm'));
	$('.clock__weekday').html(moment().format('dddd'));
	$('.clock__date').html(moment().format('D MMMM'));
}

var updateWeather = function() {
	var lat = 40.780366;
	var lon = -73.948188;

	var weatherRequest = $.ajax({
		url: 'https://api.openweathermap.org/data/2.5/weather?lat=40.780366&lon=-73.948188&appid=' + weatherapikey + '&units=imperial',
		success: function(data) {
			$(".weather__temp").text(Math.round(data.main.temp) + "°");
			$(".weather__humidity").text("Humidity " + Math.round(data.main.humidity) + "%");

			var feels = calculateFeels(data.main.temp, data.main.humidity, data.wind.speed);
			if(feels) {
				$(".weather__feels").text("Feels like " + Math.round(feels) + "°")
			} else {
				$(".weather__feels").text();
			}

			if(data.wind.speed >= 0.5) {
				$(".weather__wind").text("Wind " + Math.round(data.wind.speed)).append(" <span class='weather__windunit'>MPH</span>");
			} else {
				$(".weather__wind").text("Wind is calm");
			}
		},
		timeout: 3000,
		error: function(jqXHR, textStatus, errorThrown) {
			console.warn("Weather returned error: " + errorThrown);
		}
	});
}

function calculateFeels(temperature, humidity, wind) {
	var feel = false;

	if(temperature >= 75) {
		feel = calculateHeatIndex(temperature, humidity);

		if(feel <= temperature) {
			feel = false;
		}
	} else if(temperature <= 55 && wind >= 3){
		feel = calculateWindChill(temperature, wind);

		if(feel >= temperature) {
			feel = false;
		}
	}

	return feel;
}

function calculateHeatIndex(T, RH){
	// From http://www.hpc.ncep.noaa.gov/html/heatindex_equation.shtml
	var estimation = HI = 0.5 * (T + 61.0 + ((T-68.0)*1.2) + (RH*0.094));

	if(((estimation + T) / 2) < 80){
		return T;
	}

	var HI = -42.379 + (2.04901523*T) + (10.14333127*RH) - (.22475541*T*RH) - (.00683783*T*T) - (.05481717*RH*RH) + (.00122874*T*T*RH) + (.00085282*T*RH*RH) - (.00000199*T*T*RH*RH);

	if(T >= 80 && T <= 112 && RH < 13) {
		HI -= ((13-RH)/4)*Math.sqrt((17-Math.abs(T-95.))/17);
	} else if(T >= 80 && T <= 87 && RH > 85) {
		HI += ((RH-85)/10) * ((87-T)/5)
	}

	return Math.round(HI);
}

function calculateWindChill(T, V){
	return Math.round(35.74 + (0.6215*T) - (35.75*Math.pow(V,0.16)) + (0.4275*T*Math.pow(V,0.16)));
}

// Document is ready, do this stuff.
$(function() {
	// Set up button clicks and long-press events.
	$('button[data-actiontype], .room').longpress(
		function() {
			controlOutlets($(this), "off");
		},
		function() {
			controlOutlets($(this), "");
		},
		500
	);

	// Debug refresh hold.
	$('.clock__weekday').longpress(
		function() {
			window.location.reload();
		},
		function() {
		},
		100
	);

	// Enable FastClick.
	FastClick.attach(document.body);

	queryOutletStatus();
	var intervalOutlets = setInterval(queryOutletStatus, 2000);

	refreshClock();
	var intervalClock = setInterval(refreshClock, 2500);

	updateWeatherFirstTime();
	var intervalWeather = setInterval(updateWeather, (5 * 60 * 1000));
});

// Handles quick button taps by queueing them.
(function(a){var b=a({});a.ajaxQueue=function(c){function g(b){d=a.ajax(c).done(e.resolve).fail(e.reject).then(b,b)}var d,e=a.Deferred(),f=e.promise();b.queue(g),f.abort=function(h){if(d)return d.abort(h);var i=b.queue(),j=a.inArray(g,i);j>-1&&i.splice(j,1),e.rejectWith(c.context||c,[f,h,""]);return f};return f}})(jQuery)
