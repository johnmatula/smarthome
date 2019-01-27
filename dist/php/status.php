<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

include "codes.php";

// Before each load, get the current state. It has to be created on first run.
$statejson = @file_get_contents('status.json');
$state = new stdClass();

if($statejson === false || (isset($_GET["action"]) && $_GET["action"] == "reset")) {
	$state = (object)array(
		"behavior" => "additive",
		"outlets" => new stdClass(),
		"rooms" => new stdClass(),
	);

	foreach($codes as $outlet_key => $outlet_value) {
		$state->outlets->$outlet_key = false;
	}

	foreach($rooms as $room_key => $room_value) {
		$state->rooms->$room_key = false;
	}
} else {
	$state = json_decode($statejson);
}


if(isset($_GET["action"]) && $_GET["action"] == "behavior") {
	$state->behavior = ($state->behavior == "additive" ? "subtractive" : "additive");
}


// Default action (i.e., no keyword) is to view the current state. If no valid
// file exists, it will be created since this is called on initial page load.
if(isset($_GET["action"]) && $_GET["action"] != "reset") {

	$outlets = $_GET["outlets"];
	$turnoff = $_GET["turnoff"];

	if($_GET["action"] == "toggle") {
		foreach($outlets as $outlet) {
			$state->outlets->$outlet = (($state->outlets->$outlet) ? false : true);

			if($turnoff === "off") {
				$state->outlets->$outlet = false;
			}

			send_outlet_command($outlet, $state->outlets->$outlet, $codes, $executable, $gpio_pin);
		}
	}

	else if($_GET["action"] == "sceneset") {
		$scene_outlets = $scenes[$_GET["outlets"][0]];

		if($turnoff === "off") {
			$scene_outlets = array();
			$outlets_to_turn_off = $scenes[$_GET["outlets"][0]];
		} else {
			$outlets_to_turn_off = array_diff(array_keys($codes), $scene_outlets);
		}

		foreach($scene_outlets as $outlet) {
			if($state->outlets->outlet === true) continue;
			
			$state->outlets->$outlet = true;
			send_outlet_command($outlet, true, $codes, $executable, $gpio_pin);
		}

		foreach($outlets_to_turn_off as $outlet) {
			if($state->outlets->outlet === false) continue;
			
			$state->outlets->$outlet = false;
			send_outlet_command($outlet, false, $codes, $executable, $gpio_pin);
		}
	}

	else if($_GET["action"] == "roomset") {
		$room_name = $_GET["outlets"][0];
		$room_outlets = $rooms[$room_name];
		$room_will_be = (($state->rooms->$room_name) ? false : true);

		if($turnoff === "off") {
			$room_will_be = false;
		}

		foreach($room_outlets as $outlet) {
			$state->outlets->$outlet = $room_will_be;

			send_outlet_command($outlet, $room_will_be, $codes, $executable, $gpio_pin);
		}

		if($state->behavior == "subtractive" && $room_will_be) {
			$rooms_to_turn_off = array_diff(array_keys($rooms), array($room_name));

			foreach($rooms_to_turn_off as $room_outlets_to_turn_off) {
				foreach($rooms[$room_outlets_to_turn_off] as $outlet) {
					$state->outlets->$outlet = false;
					send_outlet_command($outlet, false, $codes, $executable, $gpio_pin);
				}
			}
		}
	}

	else if($_GET["action"] == "global") {
		foreach($codes as $outlet_key => $outlet_value) {
			$state->outlets->$outlet_key = ($_GET["outlets"][0] === 'true');
			send_outlet_command($outlet_key, $state->outlets->$outlet_key, $codes, $executable, $gpio_pin);
		}
	}
}


// Before exiting, echo out the current state for jQuery to use and save the
// state to the file. This is where we'll set the room status, too.
foreach($rooms as $room_key => $room_value) {
	$state->rooms->$room_key = true;

	foreach($room_value as $outlet) {
		if(!$state->outlets->$outlet) {
			$state->rooms->$room_key = false;
			continue;
		}
	}
}

$statejson = json_encode($state);
file_put_contents('status.json', $statejson);

die($statejson);


////
function send_outlet_command($outlet, $target_status, $codes, $executable, $gpio_pin) {
	$status = ($target_status ? "on" : "off");
	$code = $codes[$outlet][$status];
	$pulse = $codes[$outlet]["pulse"];

	shell_exec($executable . ' ' . $code . ' -p ' . $gpio_pin . ' -l ' . $pulse);
}
?>
