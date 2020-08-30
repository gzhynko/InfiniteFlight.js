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
        _port = 10112;
        s.close();
        client = new net.Socket();
        client.connect(parseInt(_port), _addr);
        console.log("Connected to Infinite Flight at " + _addr + ':' + _port);
        success();
      }
    });
    s.bind(15000);
  } catch {
    error();
  }
}

exports.writeBool = function (val) {
  if (val === true) {
    client.write(Buffer.from([01]));
  } else {
    client.write(Buffer.from([00]));
  }
}

exports.writeInt = function (val) {
  var data = Buffer.allocUnsafe(4);
  data.writeInt32LE(val);
  client.write(data);
}

exports.writeFloat = function (val) {
  var data = Buffer.allocUnsafe(4);
  data.writeFloatLE(val);
  client.write(data);
}


exports.writeDouble = function (val) {
  var data = Buffer.allocUnsafe(4);
  data.writeDoubleLE(val);
  client.write(data);
}

exports.writeString = function (val) {
  var data = new Uint8Array(val.length + 4);
  data[0] = val.length();
  for (var i=0;i<val.length;i++) {
    data[i+4] = val.charCodeAt(i);
  }
  client.write(data);
}

exports.readBool = function (val) {
  return (val.toJSON() === true);
}

exports.readInt = function (val) {
  return val.readInt32LE();
}

exports.readFloat = function(val) {
  return val.readFloatLE();
}

exports.readDouble = function (val) {
  return val.readDoubleLE();
}

exports.readString = function(val) {
  return val.toString();
}

// Not working
// exports.readLong = function(val) {
//   return val.readInt64LE();
// }
// exports.getState = function (command, retType) {
//   if (retType == null) {
//     throw new Error("Return Type Parameter Requried for GetState Requests");
//   }
//   exports.writeInt(command);
//   exports.writeBool(false);
//   var i = 0;
//   client.on("data", function(chunk) {
//     if (retType == 4) {
//       if (i == 3) {
//         return exports.readString(chunk);
//       }
//     } else {
//       if (i == 2) {
//         if (retType == 0) {
//           return exports.readBool(chunk);
//         } else if (retType == 1) {
//           return exports.readInt(chunk);
//         } else if (retType == 2) {
//           return exports.readFloat(chunk);
//         } else if (retType == 3) {
//           return exports.readDouble(chunk);
//         } else if (retType == 5) {
//           throw new Error("Longs Not Supported");
//         } else {
//           throw new Error("Invalid Return Type");
//         }
//       }
//     }
//     i++;
//   });
// }

// exports.setState = function (command, value, valueType) {
//   exports.writeInt(command);
//   exports.writeBool(true);
//   if (valueType == 0) {
//     exports.writeBool(value);
//   } else if (valueType == 1) {
//     exports.writeInt(value);
//   } else if (valueType == 2) {
//     exports.writeFloat(value);
//   } else if (valueType == 3) {
//     exports.writeDouble(value);
//   } else if (valueType == 4) {
//     exports.writeString(value);
//   } else if (valueType == 5) {
//     throw new Error("Longs Not Supported");
//   } else {
//     throw new Error("Invalid Value Type");
//   }
// }

exports.runCmd = function (command) {
  exports.writeInt(command);
  exports.writeBool(false);
}

exports.onMessage = function(callback) {
  client.on('data', function(chunk) {
    callback(chunk);
  })
}