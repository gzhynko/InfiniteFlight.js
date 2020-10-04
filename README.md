
# InfiniteFlight.js

An Extremely Simple JavaScript Module for V2 of the Infinite Flight Connect API.

## Installation

InfiniteFlight.js can be installed with npm:

```
npm install infiniteflightjs -g
```

## Using the Module  

### Initialization

After requiring the module, call `InfiniteFlight.init()` and assign it to a variable. This will be your `IFTCPClient` class.

### Connection

Call  `IFTCPClient.establishConnection(success, error, logStatus)` to establish the connection to Infinite Flight. This will call your `success` function upon success, or your `error` function on failure. Neither the success or error functions accept arguments. Set `logStatus` to `true` to log the connection process to console (defaults to `false`).

### Manifest and commands

To get the `command manifest`, call `IFTCPClient.retrieveManifest()`. This returns a `Promise` which, after resolved, returns a CSV-like string containing the manifest.

To send a command to Infinite Flight call `IFTCPClient.runCmd(commandID)`. CommandID should be a number found in the command manifest near the command you want to send. See [here](https://github.com/flyingdevelopmentstudio/infiniteflight-api#simulator-states) for an example and format of the command manifest.

### Events

Subscribe to `IFTCPClient.onMessage(callback)` for response messages from Infinite Flight. The provided `callback` function will be executed each time a message is received from Infinite Flight and takes a single argument - the received message in plain text.

Subscribe to `IFTCPClient.onTimeout(callback)` for a callback in case of a connection timeout (can be set with `IFTCPClient.setSocketTimeout(timeout)`). This does not close the socket connection.

Subscribe to `IFTCPClient.onDisconnect(callback)` for a callback in case of a socket disconnection.  After this event is fired, you can try to reconnect to IF using something like this:
```javascript
tcpClient.onDisconnect(function() {
  // Ensures the connection is fully closed.
  tcpClient.endConnection();

  tcpClient.establishConnection(() =>  clientConnected(), () => error(), true);
});
```
Note that *after reconnection all event listeners are unset*.

### Writing data to socket

Use `IFTCPClient.write[<Type>](val)` to write data to socket, where `[<Type>]` is the type of data you want to write (Int/String/Bool/Double/Float) and `val` is the actual data you want to write.

### Reading data

Use `IFTCPClient.read[<Type>](val)` to read data (convert Buffer to readable value), where `[<Type>]` is the type of data you want to read (Int/String/Bool/Double/Float) and `val` is the actual data you want to read.

You can also use `IFTCPClient.parseResponseByType(val, type)` to read `val` of `type` (numeric value, see [here](https://github.com/flyingdevelopmentstudio/infiniteflight-api#obtaining-the-manifest)).

---

### Example

A very simple example showing all features is available [in the example folder](https://github.com/Velocity23/InfiniteFlight.js/blob/v2/example/IFJS_Example.js).

### Requirements

- Node.js `dgram` module

- Node.js `net` module

- Node.js `promise-socket` module

## Contributing

I welcome any contributions to improve this service. Simply fork, change and open a PR. This code is licensed under the GNU GPLv3 License. Bug reports are welcome through the issues feature.
