var dgram = require('dgram');
var net = require('net');
var _addr, _port, client;

exports.init = function (success, error) {
  try {
    var s = dgram.createSocket('udp4');
    s.on('message', function(msg, rinfo) {
      var response = JSON.parse(msg.toString());
      if (response.Addresses[1] && response.Port) {
        _addr = response.Addresses[1];
        _port = 10111;
        s.close();
        client = new net.Socket();
        client.connect(parseInt(_port), _addr);
        console.log("Connected to Infinite Flight at " + _addr + ':' + 10111);
        client.on('data', function(chunk) {
          exports.messages.push(chunk.toJSON());
          console.log(chunk.toJSON());
        });
        success();
      }
    });
    s.bind(15000);
  } catch {
    error();
  }
}

exports.writeBool = function (cmd) {
  if (cmd === true) {
    client.write(Buffer.from([01]));
  } else {
    client.write(Buffer.from([00]));
  }
}

exports.writeInt = function (cmd) {
  var data = Buffer.allocUnsafe(1);
  data.writeInt32LE(cmd);
  client.write(data);
}

exports.writeString = function (cmd) {
  var data = new Uint8Array(cmd.length + 4);
  data[0] = cmd.length();
  for (var i=0;i<cmd.length;i++) {
    data[i+4] = cmd.charCodeAt(i);
  }
  client.write(data);
}

exports.readBool = function (val) {
  return (val.toJSON() === true);
}

exports.readInt = function (val) {
  return val.readIntLE();
}

exports.messages = [];