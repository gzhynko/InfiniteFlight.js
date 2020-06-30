const InfiniteFlight = require('../InfiniteFlight');

InfiniteFlight.init(function() {
    InfiniteFlight.writeInt(-1);
    InfiniteFlight.writeBool(false);
    console.log("Written");
}, function() {
    throw new Error('Error Connecting to Infinite Flight');
});