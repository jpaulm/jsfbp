var fbp = require('../..');
  , Fiber = require('fibers')
  , IP = require('../../core/IP')
  , WebSocketServer = require('ws').Server;

module.exports = function wsrecv() {
  var proc = fbp.getCurrentProc();
  var inport = fbp.InputPort.openInputPort('PORTNO');
  var ip = inport.receive();
  var portno = ip.contents;
  var wss = new WebSocketServer({ port: portno });
  var ws = null;
  while (true) {
    fbp.setCallbackPending(true);

    var result = wsReceive(wss, ws, proc);
    console.log('wsReceive complete: ' + proc.name);
    //console.log(result);
    if (result[1].endsWith('@kill')) {
      break;
    }
    fbp.setCallbackPending(false);
    var outport = fbp.OutputPort.openOutputPort('OUT');
    outport.send(IP.createBracket(fbp.IP.OPEN));
    outport.send(IP.create(result[0]));
    outport.send(IP.create(result[1]));
    outport.send(IP.createBracket(fbp.IP.CLOSE));
  }
}

function wsReceive(wss, ws, proc) {
  //var fiber =  Fiber.current;
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      //fbp.setCurrentProc(proc);
      console.log('running callback for: ' + proc.name);
      fbp.queueCallback(proc, [ws, message]);
    });
    ws.send('connected!');
  });
  console.log('wsReceive pending: ' + proc.name);
  return Fiber.yield();
}

String.prototype.endsWith = function (s) {
  return this.length >= s.length && this.substr(this.length - s.length) == s;
}
