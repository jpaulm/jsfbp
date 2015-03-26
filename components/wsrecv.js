'use strict';

var IP = require('../core/IP')
  , WebSocketServer = require('ws').Server;

module.exports = function wsrecv(runtime) {
  var inport = this.openInputPort('PORTNO');
  var ip = inport.receive();
  var portno = ip.contents;
  var wss = new WebSocketServer({ port: portno });
  var ws = null;
  while (true) {
    var result = runtime.runAsyncCallback(genWsReceiveFun(runtime, wss, ws, this));
    console.log('wsReceive complete: ' + this.name);
    //console.log(result);
    if (result[1].endsWith('@kill')) {
      break;
    }

    var outport = this.openOutputPort('OUT');
    outport.send(this.createIPBracket(IP.OPEN));
    outport.send(this.createIP(result[0]));
    outport.send(this.createIP(result[1]));
    outport.send(this.createIPBracket(IP.CLOSE));
  }
}

function genWsReceiveFun(runtime, wss, ws, proc) {
  return function (done) {
    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        console.log('running callback for: ' + proc.name);
        done([ws, message]);
      });
      ws.send('connected!');
    });
    console.log('wsReceive pending: ' + proc.name);
  };
}

String.prototype.endsWith = function (s) {
  return this.length >= s.length && this.substr(this.length - s.length) == s;
}
