var fbp = require('..') 
  , Fiber = require('fibers')
  , IP = require('../core/IP')
  , InputPort = require('../core/InputPort')
  , OutputPort = require('../core/OutputPort')
  , WebSocketServer = require('ws').Server;

module.exports = function wsrecv(runtime) {
  var proc = runtime.getCurrentProc();
  var inport = InputPort.openInputPort('PORTNO');
  var ip = inport.receive();
  var portno = ip.contents;
  var wss = new WebSocketServer({ port: portno });
  var ws = null;
  while (true) {
    runtime.setCallbackPending(true);

    var result = wsReceive(runtime, wss, ws, proc);
    console.log('wsReceive complete: ' + proc.name);
    //console.log(result);
    if (result[1].endsWith('@kill')) {
      break;
    }
    runtime.setCallbackPending(false);
    var outport = OutputPort.openOutputPort('OUT');
    outport.send(IP.createBracket(IP.OPEN));
    outport.send(IP.create(result[0]));
    outport.send(IP.create(result[1]));
    outport.send(IP.createBracket(IP.CLOSE));
  }
}

function wsReceive(runtime, wss, ws, proc) {
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('running callback for: ' + proc.name);
      runtime.queueCallback(proc, [ws, message]);
    });
    ws.send('connected!');
  });
  console.log('wsReceive pending: ' + proc.name);
  return Fiber.yield();
}

String.prototype.endsWith = function (s) {
  return this.length >= s.length && this.substr(this.length - s.length) == s;
}
