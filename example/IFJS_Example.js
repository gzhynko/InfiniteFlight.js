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
});

function clientConnected(){
	// Use this to get the command manifest
	tcpClient.writeInt(-1);
	tcpClient.writeBool(false);

	// , OR:
	tcpClient.retrieveManifest();

	// Set socket to timeout after 10 seconds of inactivity
	tcpClient.setSocketTimeout(1000 * 10);

	// Log the response (represented here by 'chunk') client receives from server. 
	tcpClient.onMessage(function(chunk) {
		// 4 is for String. See here for more info: https://github.com/flyingdevelopmentstudio/infiniteflight-api#obtaining-the-manifest
		console.log(tcpClient.parseResponseByType(chunk, 4));
	});

	// Log "Socket timeout" when socket times out. 
	// Note that this does NOT close the socket connection.
	tcpClient.onTimeout(function() {
		console.log("Socket timeout");
	});

	// Log "Socket disconnected" when socket connection closes. 
	tcpClient.onDisconnect(function() {
		console.log("Socket disconnected");
	});
}