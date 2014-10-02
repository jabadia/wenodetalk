var module = angular.module('ArduinoRest',['ngResource']);

module.factory('ArduinoSensors', function($resource)
{
	return $resource('http://localhost:3000/:sensor', {}, {
		getDistance: { method: 'GET', params: {sensor:'distance'}, isArray:false },
		getFlex:     { method: 'GET', params: {sensor:'flex'}, isArray:false },
		getLight:    { method: 'GET', params: {sensor:'photo'}, isArray: false }
	});
});

module.factory('ArduinoLeds', function($resource)
{
	return $resource('http://localhost:3000/led/:pin',{}, {
		getLeds:  { method: 'GET', params: {pin:''}, isArray: false},
		getState: { method: 'GET', params: {}, isArray:false },
		setState: { method: 'POST', params: {}, isArray: false }
	});
});

module.factory('ArduinoServo', function($resource)
{
	return $resource('http://localhost:3000/servo',{}, {
		getPosition: { method: 'GET', params: {}, isArray:false },
		setPosition: { method: 'POST', params: {}, isArray: false }
	});
});

