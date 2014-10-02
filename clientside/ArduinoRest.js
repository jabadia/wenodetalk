var module = angular.module('ArduinoRest',['ngResource']);

module.url = location.protocol + "//" + location.hostname + ':3000'; // same host, different port

module.factory('ArduinoSensors', function($resource)
{
	return $resource(module.url + '/:sensor', {}, {
		getDistance: { method: 'GET', params: {sensor:'distance'}, isArray:false },
		getFlex:     { method: 'GET', params: {sensor:'flex'}, isArray:false },
		getLight:    { method: 'GET', params: {sensor:'photo'}, isArray: false }
	});
});

module.factory('ArduinoLeds', function($resource)
{
	return $resource(module.url + '/led/:pin',{}, {
		getLeds:  { method: 'GET', params: {pin:''}, isArray: false},
		getState: { method: 'GET', params: {}, isArray:false },
		setState: { method: 'POST', params: {}, isArray: false }
	});
});

module.factory('ArduinoServo', function($resource)
{
	return $resource(module.url + '/servo',{}, {
		getPosition: { method: 'GET', params: {}, isArray:false },
		setPosition: { method: 'POST', params: {}, isArray: false }
	});
});

