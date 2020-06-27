const InfiniteFlight = require('../InfiniteFlight');

InfiniteFlight.init(function() {
    InfiniteFlight.onMessage(function(msg) {
        console.log(msg);
    });
    InfiniteFlight.sendCmd('Commands.FlapsFullDown', []);
    InfiniteFlight.sendCmd('Commands.ParkingBrakes', []);
}, function() {
    throw new Error('Error Connecting to Infinite Flight');
});