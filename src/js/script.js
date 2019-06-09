var requests = false;
var timeout;
var specialInterval;
var previousButton;
var weatherapikey = false;
var PRIDE_COLOR_COUNT = 9;
var BUTTON_COUNT = 16;
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
		$("button[data-outlets*=" + outlet + "]").attr("data-status", (data.outlets[outlet] ? "on" : "off"));
	});

	Object.keys(data.rooms).forEach(function (outlet) {
		$(".room[data-outlets*=" + outlet + "]").attr("data-status", (data.rooms[outlet] ? "on" : "off"));
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
			if(feels !== false) {
				$(".weather__feels").text("Feels like " + Math.round(feels) + "°")
			} else {
				$(".weather__feels").text("");
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

function setTheme(theme) {
  window.clearInterval(specialInterval);
  
  
  theme = theme || localStorage.getItem("smarthomeTheme") || "dark";
  
  $(".toggles__button svg").removeClass("svg--pride");
  $(".toggles__button svg").removeClass(function (index, css) {
  	return (css.match (/\bsvg--pride--color\S+/g) || []).join(' ');
  });
  
  $(".js--selected").removeClass("js--selected");
  $("button[data-theme=" + theme + "]").parent().addClass("js--selected");
  
  if(theme == "dark") {
    cssVars({
      variables: {
        "--background-body": "#000",
        "--background-settings": "rgba(15,15,15,.975)",
        "--background-backdrop": "#292B2A",
        "--background-outlet-off": "#292B2A00",
        "--background-outlet-off-active": "#79FEBC",
        "--background-outlet-on": "#494B4A",
        "--background-outlet-on-active": "#19653F",
        "--color-emphasis": "#DAE0DD",
        "--color-body": "#838785",
        "--color-outlet-off": "#DAE0DD",
        "--color-outlet-off-active": "#FFF",
        "--color-outlet-on": "#FAFFFC",
        "--color-outlet-on-active": "#DAE0DD",
        "--color-scene": "#838785"
      }
    });
  } else if(theme == "daylight") {
    cssVars({
      variables: {
        "--background-body": "#fefefe",
        "--background-settings": "rgba(250,250,250,.975)",
        "--background-backdrop": "#f4f4f4",
        "--background-outlet-off": "#f4f4f400",
        "--background-outlet-off-active": "#79FEBC",
        "--background-outlet-on": "#79FEBC",
        "--background-outlet-on-active": "#19653F",
        "--color-emphasis": "#111",
        "--color-body": "#777",
        "--color-outlet-off": "#777",
        "--color-outlet-off-active": "#000",
        "--color-outlet-on": "#000",
        "--color-outlet-on-active": "#000",
        "--color-scene": "#777"
      }
    });
  } else if(theme == "pride") {
    cssVars({
      variables: {
        "--background-body": "#000",
        "--background-settings": "rgba(15,15,15,.975)",
        "--background-backdrop": "#292929",
        "--background-outlet-off": "rgba(0, 0, 0, 0)",
        "--background-outlet-off-active": "rgba(255, 255, 255, 0.4)",
        "--background-outlet-on": "rgba(255, 255, 255, 0.1)",
        "--background-outlet-on-active": "rgba(255, 255, 255, 0.2)",
        "--color-emphasis": "rgba(255, 255, 255, .875)",
        "--color-body": "#858585",
        "--color-outlet-off": "rgba(255, 255, 255, .875)",
        "--color-outlet-off-active": "#fff",
        "--color-outlet-on": "rgba(255, 255, 255, .975)",
        "--color-outlet-on-active": "#fff",
        "--color-scene": "#838785"
      }
    });
    
    setPrideColors();
    specialInterval = window.setInterval(changePrideColors, 5000);
  }
  
  localStorage.setItem("smarthomeTheme", theme);
}

function setPrideColors() {
  $(".toggles__button svg").each(function() {
    $(this).addClass("svg--pride");
  
    var colorIndex = Math.floor(Math.random() * PRIDE_COLOR_COUNT);
    $(this).addClass("svg--pride--color" + colorIndex);
  });
}

function changePrideColors() {
  var buttonAmount = 4;
  var buttonArray = [];
  
  while(buttonArray.length < buttonAmount){
    var r = Math.floor(Math.random() * BUTTON_COUNT) + 1;
    if(buttonArray.indexOf(r) === -1) {
      buttonArray.push(r);
    }
  }
  
  for(var i = 0; i < buttonArray.length; i++) {
    var goodRandomFound  = false;
    var colorIndex;
    var $randomSvg = $(".toggles__button:nth-child(" + buttonArray[i] + ") svg");
    
    while(!goodRandomFound) {
      colorIndex = Math.floor(Math.random() * PRIDE_COLOR_COUNT);

      if(!($randomSvg.hasClass("svg--pride--color" + colorIndex))) {
        $randomSvg.removeClass(function (index, css) {
        	return (css.match (/\bsvg--pride--color\S+/g) || []).join(' ');
        });
        goodRandomFound = true;
      }
    }
    
    $randomSvg.addClass("svg--pride--color" + colorIndex);
  }
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

	// Settings.
	$('button[data-settings]').click(function(e) {
    $button = $(e.target);
    
    if($button.attr('data-settings') == 'reload') {
      window.location.reload();
    } else if($button.attr('data-settings') == 'reset') {
      localStorage.clear();
      window.location.reload();
    } else if($button.attr('data-settings') == 'theme') {
      setTheme($button.attr('data-theme'));
    }
	});
  
  $(".clock, .headerbar__close").click(function() {
    $(".settings").toggleClass("js--visible");
  });

	// Enable FastClick.
	FastClick.attach(document.body);

	queryOutletStatus();
	var intervalOutlets = setInterval(queryOutletStatus, 2000);

	refreshClock();
	var intervalClock = setInterval(refreshClock, 2500);

	updateWeatherFirstTime();
	var intervalWeather = setInterval(updateWeather, (5 * 60 * 1000));
  
  setTheme();
  
  cssVars({
    // Treat all browsers as legacy
    watch: true
  });
});


// Handles quick button taps by queueing them.
(function(a){var b=a({});a.ajaxQueue=function(c){function g(b){d=a.ajax(c).done(e.resolve).fail(e.reject).then(b,b)}var d,e=a.Deferred(),f=e.promise();b.queue(g),f.abort=function(h){if(d)return d.abort(h);var i=b.queue(),j=a.inArray(g,i);j>-1&&i.splice(j,1),e.rejectWith(c.context||c,[f,h,""]);return f};return f}})(jQuery)

// Random element from jQuery list
$.fn.random = function() {
  return this.eq(Math.floor(Math.random() * this.length));
}
