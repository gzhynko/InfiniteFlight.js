var dgram = require('dgram');
var net = require('net');
const { PromiseSocket } = require("promise-socket");

exports.init = function () {
  return new IFTCPClient();
}

class IFTCPClient {
  constructor () {
    this.client = new PromiseSocket(new net.Socket()); 
    this.ipAddress = ""; 
    this.port = 0;
    this.connected = false;
  }

  connect (ip, port) {
    return this.client.connect(parseInt(port), ip);
  }

  establishConnection (success, error, logStatus = false) {
    var s = dgram.createSocket('udp4');
    s.bind(15000);

    if(logStatus)
      console.log("Connecting to Infinite Flight...");

    s.on('message', function(msg) {
      var response = JSON.parse(msg.toString());

      if (response.Addresses[1] && response.Port) {
        this.ipAddress = response.Addresses[1];
        this.port = 10112;
        s.close();

        if(logStatus)
          console.log("Found an Infinite Flight instance running on " + this.ipAddress + ". Establishing connection with it...");

        var startTime = process.hrtime();

        this.connect(this.ipAddress, this.port).then(function(){
          if(logStatus) {
            var endTime = process.hrtime(startTime);
            var elapsedMilliseconds = (endTime[0]* 1000000000 + endTime[1]) / 1000000;
            console.log("Connected to Infinite Flight at " + this.ipAddress + ":" + this.port + ". This took " + Math.round(elapsedMilliseconds) + "ms.");
          }

          this.connected = true;

          success();        
        }.bind(this)).catch((reason) => {
          if(logStatus)
            console.log("Connection rejected: " + reason);
          
          this.connected = false;

          error();
        });
      }
    }.bind(this));
  }

  writeBool (val) {
    if(this.connected != true) return;

    if (val === true) {
      this.client.write(Buffer.from([1]));
    } else {
      this.client.write(Buffer.from([0]));
    }
  }

  writeInt (val) {
    if(this.connected != true) return;

    var data = Buffer.allocUnsafe(4);
    data.writeInt32LE(val);
    this.client.write(data);
  }

  writeFloat (val) {
    if(this.connected != true) return;

    var data = Buffer.allocUnsafe(4);
    data.writeFloatLE(val);
    this.client.write(data);
  }

  writeDouble (val) {
    if(this.connected != true) return;

    var data = Buffer.allocUnsafe(4);
    data.writeDoubleLE(val);
    this.client.write(data);
  }

  writeString (val) {
    if(this.connected != true) return;

    var data = new Uint8Array(val.length + 4);
    data[0] = val.length();
    for (var i=0;i<val.length;i++) {
      data[i+4] = val.charCodeAt(i);
    }
    this.client.write(data);
  }

  readBool (val) {
    if(this.connected != true) return;

    return (val.toJSON() === true);
  }

  readInt (val) {
    if(this.connected != true) return;

    return val.readInt32LE();
  }

  readFloat (val) {
    if(this.connected != true) return;

    return val.readFloatLE();
  }
  
  readDouble (val) {
    if(this.connected != true) return;

    return val.readDoubleLE();
  }
  
  readString (val) {
    if(this.connected != true) return;

    return String.fromCharCode.apply(null, new Uint8Array(val));
  }

  runCmd (commandID) {
    this.writeInt(commandID);
    this.writeBool(false);
  }

  retrieveManifest () {
    this.runCmd(-1);
  }
  
  setSocketTimeout (timeout) {
    this.client.setTimeout(timeout);
  }
  
  onMessage (callback) {
    if(this.connected != true) return;

    this.client.stream.on('data', function(chunk) {
      callback(chunk);
    });
  }
  
  onTimeout (callback) {
    if(this.connected != true) return;

    this.client.stream.on('timeout', function(){
      callback();
    });
  }

  onDisconnect (callback) {
    if(this.connected != true) return;

    this.client.stream.on('close', function(){
      callback();
    });
  }
}