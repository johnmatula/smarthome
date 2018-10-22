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
	"bedroom_rice" => array(
		"id" => "0301.3",
		"on" => 1398531,
		"off" => 1398540,
		"pulse" => 183
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
		"kitchen_cupboards",
		"kitchen_pendant",
		"kitchen_table"
	),
	"living" => array(
		"living_north",
		"living_south",
		"living_desk"
	)
);


$scenes = array(
	"morning" => array(
		"kitchen_cupboards",
		"closet_closet",
		"bedroom_left",
		"bedroom_right"
	),
	"cloudy" => array(
		"kitchen_cupboards",
		"kitchen_window",
		"study_desk"
	),
	"evening" => array(
		"kitchen_cupboards",
		"kitchen_window",
		"living_rice",
		"study_desk"
	),
	"bedtime" => array(
		"closet_closet",
		"bedroom_left"
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


/*
ON	OFF	Pulse
1	1398067	1398076	183
2	1398211	1398220	183
3	1398531	1398540	183
4	1400067	1400076	183
5	1406211	1406220	183

*/
