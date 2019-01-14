<?php

$codes = array(
	"kitchen_pendant" => array(
		"id" => "0315.1",
		"on" => 54579,
		"off" => 54588,
		"pulse" => 189
	),
	"hall_console" => array(
		"id" => "0315.2",
		"on" => 54723,
		"off" => 54732,
		"pulse" => 189
	),
	"hall_twinkle" => array(
		"id" => "0315.3",
		"on" => 55043,
		"off" => 55052,
		"pulse" => 189
	),
	"living_desk" => array(
		"id" => "0315.4",
		"on" => 56579,
		"off" => 56588,
		"pulse" => 189
	),
	"living_south" => array(
		"id" => "0301.1",
		"on" => 1398067,
		"off" => 1398076,
		"pulse" => 183
	),
	"living_north" => array(
		"id" => "0301.2",
		"on" => 1398211,
		"off" => 1398220,
		"pulse" => 183
	),
	"living_windoweast" => array(
		"id" => "0307.2",
		"on" => 87491,
		"off" => 87500,
		"pulse" => 174
	),
	"living_windowwest" => array(
		"id" => "0307.1",
		"on" => 87347,
		"off" => 87356,
		"pulse" => 174
	),
	"bedroom_rice" => array(
		"id" => "0301.3",
		"on" => 1398531,
		"off" => 1398540,
		"pulse" => 183
	),
	"bedroom_salt" => array(
		"id" => "0307.5",
		"on" => 95491,
		"off" => 95500,
		"pulse" => 174
	),
	"kitchen_table" => array(
		"id" => "0301.4",
		"on" => 1400067,
		"off" => 1400076,
		"pulse" => 183
	),
	"kitchen_cupboards" => array(
		"id" => "0301.5",
		"on" => 1406211,
		"off" => 1406220,
		"pulse" => 183
	),
	"kitchen_abovecupboards" => array(
		"id" => "0307.3",
		"on" => 87811,
		"off" => 87820,
		"pulse" => 174
	),
);


$rooms = array(
	"bedroom" => array(
		"bedroom_rice"
	),
	"hall" => array(
		"hall_console",
		"hall_twinkle"
	),
	"kitchen" => array(
		"kitchen_abovecupboards",
		"kitchen_cupboards",
		"kitchen_pendant",
		"kitchen_table"
	),
	"living" => array(
		"living_north",
		"living_south",
		"living_desk",
		"living_windoweast",
		"living_windowwest"
	)
);


$scenes = array(
	"morning" => array(
		"bedroom_rice",
		"hall_console",
		"kitchen_cupboards",
		"kitchen_pendant",
		"living_desk"
	),
	"rainy" => array(
		"kitchen_cupboards",
		"kitchen_pendant",
		"living_desk",
		"living_south",
		"living_windoweast",
		"living_windowwest"
	),
	"evening" => array(
		"hall_twinkle",
		"kitchen_cupboards",
		"kitchen_abovecupboards",
		"living_desk",
		"living_windoweast",
		"living_windowwest",
		"bedroom_salt"
	),
	"bedtime" => array(
		"kitchen_abovecupboards",
		"bedroom_rice",
		"bedroom_salt",
		"living_windoweast",
		"living_windowwest"
	)
);

// CodeSend parameters.
$executable = '../bin/codesend';
$gpio_pin = "0";
$global_pulse = "189";

// Check if CodeSend exists.
if (!file_exists($executable)) {
	error_log("$executable is missing; please edit the script.", 0);
}
