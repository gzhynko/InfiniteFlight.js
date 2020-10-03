const InfiniteFlight = require('../InfiniteFlight');

var tcpClient;

// Assign a new instance of the IFTCPClient class to tcpClient
tcpClient = InfiniteFlight.init();

// Try to establish connection with Infinite Flight in 1 attempt.
// If it goes well, go ahead and call the clientConnected function.
// If not, throw a new error.
tcpClient.establishConnection(function () {
	clientConnected();
},
function () {
	throw new Error("Error connecting to Infinite Flight");
}, 1);

function clientConnected(){
  tcpClient.writeInt(-1);
  tcpClient.writeBool(false);
  console.log("Written");
	
	// Set socket to timeout after 10 seconds of inactivity
  tcpClient.setSocketTimeout(1000 * 10);

	// Log "Socket timeout" when socket times out. 
	// Note that this does NOT close the socket connection.
  tcpClient.onTimeout(function() {
    console.log("Socket timeout");
  });
}