var dgram = require('dgram');
var net = require('net');
const { PromiseSocket } = require("promise-socket");

exports.init = function () {
  return new IFTCPClient();
}

class IFTCPClient {
  constructor () {
    this.client; 
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

        this.client = new PromiseSocket(new net.Socket());

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
    if(!this.connected) return;

    if (val === true) {
      this.client.write(Buffer.from([1]));
    } else {
      this.client.write(Buffer.from([0]));
    }
  }

  writeInt (val) {
    if(!this.connected) return;

    var data = Buffer.allocUnsafe(4);
    data.writeInt32LE(val);
    this.client.write(data);
  }

  writeFloat (val) {
    if(!this.connected) return;

    var data = Buffer.allocUnsafe(4);
    data.writeFloatLE(val);
    this.client.write(data);
  }

  writeDouble (val) {
    if(!this.connected) return;

    var data = Buffer.allocUnsafe(4);
    data.writeDoubleLE(val);
    this.client.write(data);
  }

  writeString (val) {
    if(!this.connected) return;

    var data = new Uint8Array(val.length + 4);
    data[0] = val.length();
    for (var i=0;i<val.length;i++) {
      data[i+4] = val.charCodeAt(i);
    }
    this.client.write(data);
  }

  readBool (val) {
    return (val.toJSON() === true);
  }

  readInt (val) {
    return val.readInt32LE();
  }

  readFloat (val) {
    return val.readFloatLE();
  }
  
  readDouble (val) {
    return val.readDoubleLE();
  }
  
  readString (val) {
    return String.fromCharCode.apply(null, new Uint8Array(val));
  }

  parseResponseByType(val, type) {
    switch(type) {
      case 0:
        return this.readBool(val);
      case 1:
        return this.readInt(val);
      case 2:
        return this.readFloat(val);
      case 3: 
        return this.readDouble(val);
      case 4:
        return this.readString(val);
      case 5:
        throw new Error("Not Implemented");
    }
  }

  runCmd (commandID) {
    this.writeInt(commandID);
    this.writeBool(false);
  }

  retrieveManifest () {
    return new Promise(function(resolve, reject) {
      this.runCmd(-1);

      this.client.stream.on('data', function(chunk) {
        let data = this.parseResponseByType(chunk, 4);

        // Make sure we got a csv string
        if(data.indexOf(",") >= 0)
          resolve(data);
      }.bind(this));
    }.bind(this));
  }
  
  setSocketTimeout (timeout) {
    if(!this.connected) return;

    this.client.setTimeout(timeout);
  }
  
  onMessage (callback) {
    if(!this.connected) return;

    this.client.stream.on('data', function(chunk) {
      callback(chunk);
    });
  }
  
  onTimeout (callback) {
    if(!this.connected) return;

    this.client.stream.on('timeout', function(){
      callback();
    });
  }

  onDisconnect (callback) {
    if(!this.connected) return;

    this.client.stream.on('close', function(){
      callback();
    });
  }

  endConnection () {
    if(!this.connected) return;

    this.connected = false;
    this.client.end();
  }
}