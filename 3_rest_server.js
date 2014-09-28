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
			res.render(view, data);
			break;
		case 'json':
			res.json(data);
			break;
		default:
			res.json({error:"format " + f + " not supported"});
	}
}

/* server functions */

var board = new five.Board(),
	distance,
	latestDistanceReading;

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
}

function serverRoot(req,res)
{
	var data = {path:req.path};
	renderView(req,res,"root.jade", data);
}

function serverDistance(req,res)
{
	var data = {path:req.path};
	data.distance = latestDistanceReading;
	renderView(req,res,"distance.jade", data);
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

app.use('/', router);
app.use(logErrors);
app.use(errorHandler);

board.on('ready', function()
{
	initSensors();
	app.listen(3000, function() {	console.log("listening on http://localhost:3000"); });	
})
