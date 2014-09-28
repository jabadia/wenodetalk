"use strict";

var five = require('johnny-five');

var board = new five.Board();


function executeNextCommand(servo, commands)
{
	var nextCommand = commands.shift();

	if( !nextCommand)
		return;

	console.log("executing", nextCommand, commands.length);

	if( nextCommand.angle != undefined)
	{
		var duration = nextCommand.ms;
		servo.to(nextCommand.angle, nextCommand.ms);
		setTimeout(executeNextCommand, duration, servo,commands);		
	}
	else if( nextCommand.wait != undefined)
	{
		setTimeout(executeNextCommand, nextCommand.wait, servo, commands);
	}
	else
	{
		console.log("bad command", nextCommand);		
	}
}


board.on('ready', function()
{
	console.log("board ready");

	var servo = new five.Servo(9);

	this.repl.inject({
		servo: servo
	});

	var commands = [
		{ angle: 0 },
		{ wait: 2000},
		{ angle: 90},
		{ wait: 1500},
		{ angle: 180, ms: 3000},
		{ wait: 1500},
		{ angle: 0, ms: 3000 },
		{ angle: 90 }
		];

	executeNextCommand(servo, commands);
});