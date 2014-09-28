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

var board = new five.Board(),
	distance,
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
	distance = new five.IR.Distance({
		device: 'GP2Y0A02YK0F',
		pin: 'A5',
		freq: '100'
	});

	distance.on('data', function()
	{
		latestDistanceReading = { cm: this.cm }
	})

	servo = new five.Servo(9);
	servo.to(42);

	flex = new five.Sensor({
		pin: "A3",
		freq: '25'
	});
	flex.on('change', function()
	{
		latestFlexReading = this.value;
		minFlexReading = Math.min(latestFlexReading,minFlexReading);
		maxFlexReading = Math.max(latestFlexReading,maxFlexReading);
	})

	leds.push(new five.Led(13));
	leds.push(new five.Led(12));
	leds.push(new five.Led(11));

	leds.forEach(function(led){ led.off(); });

	photo = new five.Sensor({
		pin: "A0",
		freq: '25'
	});
	photo.on('change', function()
	{
		latestPhotoReading = this.value;
		minPhotoReading = Math.min(latestPhotoReading,minPhotoReading);
		maxPhotoReading = Math.max(latestPhotoReading,maxPhotoReading);
	})

}

function findLed(pin)
{
	var led = leds.filter(function(led){ return led.pin == pin; });
	return led.length == 1? led[0] : null;
}

function serverRoot(req,res)
{
	var data = {};
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
	servo.to(newPosition);

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
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
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
router.get('/led/:pin', serverGetLed);
router.post('/led/:pin', serverPostLed);
router.get('/photo', serverGetPhoto);

app.use('/', router);
app.use(logErrors);
app.use(errorHandler);

board.on('ready', function()
{
	initSensors();
	app.listen(3000, function() {	console.log("listening on http://localhost:3000"); });	
})
