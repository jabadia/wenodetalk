#What is this?
This is the source code for the demos that I showed in the [WeNode talk](http://wenode.barcelonajs.org/) that I gave in Barcelona on Oct 4th
#How to install?
You need node, npm and bower, and then just clone this repo and install:

    $ git clone https://github.com/jabadia/wenodetalk
    $ npm install
    $ bower install
    
#Do I need the Arduino?
If you want to have all the fun, YES, you need an Arduino board with sensors, servos and leds.

If you don't have an Arduino at hand, I have created a fake server that will return pseudo-random values from sensors and will allow you to play at least with client-side code.

    $ git checkout fake-server
    
#What is it in here?
You will find the talk slides at `slides` directory

You will find three node programs to control leds and a servo:

    $ node 0_leds.js
    $ node 1_servo.js
    $ node 2_servo.js
    
You will find the REST server, either real (`master` branch) or fake (`fake-server` branch):

    $ node 3_rest_server.js
    
You can exercise the REST server in two ways.

* open your favorite browser and navigate to [http://localhost:3000](http://localhost:3000) and then navigate to the different API endpoints for different sensors. You will see the html view of the response, but if you call the same endpoints using ajax or adding the `?f=json` parameter, then you will see the json format response

* use the client-side demos in the `clientside` directory

#About the client side demos
There are basically two set of demos with the same functionality.

* one set of demos uses jQuery for client-side programming (3_distance.html, 4_servo.html,...)


* the other set of demos uses Angular.js for client-side logic (*_ng.html files). The most interesting part of these demos is the `ArduinoRest.js` file that contains the $resource definition to access the Arduino REST API.

#References
I really encourage you to read the excellent [http://node-ardx.org/](http://node-ardx.org/) guide.
