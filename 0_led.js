"use strict";

var five = require('johnny-five');

var board = new five.Board();

board.on('ready', function()
{
	console.log("board ready");

	var led = new five.Led(13);	
	led.blink();
});