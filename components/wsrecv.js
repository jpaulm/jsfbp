'use strict';

var WebSocketServer = require('ws').Server;

module.exports = function wsrecv(runtime) {
  var inport = this.openInputPort('PORTNO');
  var outport = this.openOutputPort('OUT');
  var wssout = this.openOutputPort('WSSOUT');

  var ip = inport.receive();
  var portno = ip.contents;
  var wss = new WebSocketServer({
    port: portno
  });
  wssout.send(this.createIP(wss));

  var ws = null;
  while (true) {
    var result = runtime.runAsyncCallback(genWsReceiveFun(runtime, wss, ws, this));
    console.log('wsrecv callback complete: ' + this.name);
    //console.log(result);
    if (result[1].endsWith('@kill')) {
      break;
    }

    console.log(result);
    outport.send(this.createIPBracket(this.IPTypes.OPEN));
    outport.send(this.createIP(result[0]));
    outport.send(this.createIP(result[1]));
    outport.send(this.createIPBracket(this.IPTypes.CLOSE));
  }

  wss.close();
  this.dropIP(ip);
};

function genWsReceiveFun(runtime, wss, ws, proc) {
  return function (done) {
    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        console.log('running callback for: ' + proc.name);
        done([ws, message]);
      });
      ws.send('connected!');
    });
    console.log('wsrecv pending: ' + proc.name);
  };
}

String.prototype.endsWith = function (s) {
  return this.length >= s.length && this.substr(this.length - s.length) == s;
};
