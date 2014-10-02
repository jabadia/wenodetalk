var module = angular.module('ArduinoRest',['ngResource']);

module.factory('ArduinoRest', function($resource)
{
	return $resource('http://localhost:3000/:sensor', {}, {
		getDistance: { method: 'GET', params: {sensor:'distance'}, isArray:false },
		getFlex:     { method: 'GET', params: {sensor:'flex'}, isArray:false }
	})
});

