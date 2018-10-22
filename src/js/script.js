var requests = false;
var timeout;
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

	if(data.behavior == "additive") {
		$("button[data-actiontype=behavior]").html('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" 	 width="20px" height="20px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve"> <line fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" x1="1" y1="12" x2="11" y2="2"/> <polyline fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" points="11,8 11,2 5,2 "/> <line fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" x1="8" y1="19" x2="18" y2="9"/> <polyline fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" points="18,15 18,9 12,9 "/> </svg> ');
	} else {
		$("button[data-actiontype=behavior]").html('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" 	 width="20px" height="20px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve"> <g> 	<line fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" x1="2" y1="1.668" x2="8" y2="7.668"/> 	<polyline fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" points="12,18 18,18 18,12 	"/> 	<line fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" x1="2" y1="17.668" x2="18" y2="1.668"/> 	<polyline fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" points="18,8 18,2 12,2 	"/> 	<line fill="none" stroke="#414042" stroke-width="2" stroke-miterlimit="10" x1="12" y1="11.668" x2="18" y2="17.668"/> </g> </svg> ');
	}
};

var refreshClock = function() {
	$('.clock__time').html(moment().format('h:mm'));
	$('.clock__weekday').html(moment().format('dddd'));
	$('.clock__date').html(moment().format('D MMMM'));
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
});

// Handles quick button taps by queueing them.
(function(a){var b=a({});a.ajaxQueue=function(c){function g(b){d=a.ajax(c).done(e.resolve).fail(e.reject).then(b,b)}var d,e=a.Deferred(),f=e.promise();b.queue(g),f.abort=function(h){if(d)return d.abort(h);var i=b.queue(),j=a.inArray(g,i);j>-1&&i.splice(j,1),e.rejectWith(c.context||c,[f,h,""]);return f};return f}})(jQuery)
