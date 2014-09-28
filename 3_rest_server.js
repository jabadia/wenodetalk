"use strict";

var five 			= require('johnny-five'),
	express         = require("express"),
	bodyParser      = require("body-parser"),
	methodOverride  = require("method-override");


/* helper functions */

function errorHandler(err, req, res, next) 
{
	res.status(500);
	res.render('error', { error: err });
}

function logErrors(err, req, res, next) 
{
	console.error(err.stack);
	next(err);
}

function renderView(req,res,view,data)
{
	console.log(data);
	
	var f = req.query.f || req.accepts(['html','json']);

	switch(f)
	{
		case 'html':
			data.path = req.path;
			res.render(view, data);
			break;
		case 'json':
			res.json(data);
			break;
		default:
			res.json({error:"format " + f + " not supported"});
	}
}

function scale(value,inrange,outrange)
{
	var normalized = (value-inrange[0]) / (inrange[1]-inrange[0]);
	var outvalue = normalized * (outrange[1]-outrange[0]) + outrange[0];
	return outvalue;
	// console.log(value, normalized, inrange);
	// return normalized;
}

/* server functions */

var distance,
	latestDistanceReading,
	servo,
	flex,
	latestFlexReading,
	minFlexReading = 5000, maxFlexReading = -5000,
	leds = [],
	photo,
	latestPhotoReading,
	minPhotoReading = 5000, maxPhotoReading = -5000;

function initSensors()
{
	servo = { position: 0 };

	leds.push({pin:11, value:0, on: function() { this.value=1; }, off: function() { this.value=0; }});
	leds.push({pin:12, value:0, on: function() { this.value=1; }, off: function() { this.value=0; }});
	leds.push({pin:13, value:0, on: function() { this.value=1; }, off: function() { this.value=0; }});

	latestDistanceReading = { cm: 20.0 };

	latestFlexReading = 45.0;
	minFlexReading = 0;
	maxFlexReading = 90;

	latestPhotoReading = 50.0;
	minPhotoReading = 0;
	maxPhotoReading = 100;

	setInterval(function()
	{
		latestDistanceReading.cm += (Math.random()-0.5)*8.0;
		latestPhotoReading += (Math.random()-0.5)*8.0;
		latestFlexReading += (Math.random()-0.5)*8.0;

		latestDistanceReading.cm = Math.min(100, Math.max(20, latestDistanceReading.cm));
		latestPhotoReading =  Math.min(100, Math.max(0, latestPhotoReading));
		latestFlexReading =  Math.min(90, Math.max(0, latestFlexReading));

	}, 25);
}

function findLed(pin)
{
	var led = leds.filter(function(led){ return led.pin == pin; });
	return led.length == 1? led[0] : null;
}

function serverRoot(req,res)
{
	var data = {};
	data.msg = "Welcome to the REST server for my Arduino Kit";
	renderView(req,res,"root.jade", data);
}

function serverDistance(req,res)
{
	var data = {};
	data.distance = latestDistanceReading;
	renderView(req,res,"distance.jade", data);
}

function serverGetServo(req,res)
{
	var data = {};
	data.position = servo.position;
	renderView(req,res,"servo.jade", data);
}

function serverPostServo(req,res)
{
	var newPosition = parseFloat(req.body.position,10);
	console.log("moving servo to ", newPosition)
	servo.position = newPosition;

	var data = {};
	data.position = servo.position;
	renderView(req,res,"servo.jade", data);
}

function serverGetFlex(req,res)
{
	var data = {};
	data.flex = scale(latestFlexReading, [minFlexReading, maxFlexReading], [0,90]);
	renderView(req,res,"flex.jade", data);
}

function serverGetLeds(req,res)
{
	var data = { leds: leds.map(function(led){ return led.pin; }) };
	renderView(req,res,"led.jade",data);
}

function serverGetLed(req,res)
{
	var pin = parseInt(req.params.pin);
	var data = {};

	var led = findLed(pin);

	if( led )
	{
		data.state = led.value? "on" : "off";
	}
	else
	{
		data.error = "Can't find LED in pin " + pin;
		data.state = "unknown";
	}
	renderView(req,res,"led.jade", data);
}

function serverPostLed(req,res)
{
	var pin = parseInt(req.params.pin);
	var newState = req.body.state;
	var data = {};

	var led = findLed(pin);

	if( led )
	{
		if( newState == "on")
			led.on();
		else
			led.off();

		data.state = led.value? "on" : "off";
	}
	else
	{
		data.error = "Can't find LED in pin " + pin;
		data.state = "unknown";
	}
	renderView(req,res,"led.jade", data);
}

function serverGetPhoto(req,res)
{
	var data = {};
	data.light = scale(latestPhotoReading, [minPhotoReading, maxPhotoReading], [100,0]);
	renderView(req,res,"photo.jade", data);
}


/* server init */

var app = express();

app.engine('jade', require('jade').__express);

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
 });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();

router.get('', serverRoot);
router.get('/distance', serverDistance);
router.get('/servo', serverGetServo);
router.post('/servo', serverPostServo);
router.get('/flex', serverGetFlex);
router.get('/led/', serverGetLeds);
router.get('/led/:pin', serverGetLed);
router.post('/led/:pin', serverPostLed);
router.get('/photo', serverGetPhoto);

app.use('/', router);
app.use(logErrors);
app.use(errorHandler);

initSensors();
app.listen(3000, function() {	console.log("listening on http://localhost:3000"); });	
