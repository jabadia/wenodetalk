"use strict";

var five = require('johnny-five');

var board = new five.Board();

board.on('ready', function()
{
	console.log("board ready");

	var servo = new five.Servo(9);

	this.repl.inject({
		servo: servo
	});

	servo.to(0);
	board.wait(2000, function()
	{
		servo.to(90);
		board.wait(2000, function()
		{
			servo.to(180);
			board.wait(2000, function()
			{
				servo.to(20);
			});
		});
	});

});