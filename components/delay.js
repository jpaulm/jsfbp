'use strict';

var InputPort = require('../core/InputPort')
  , OutputPort = require('../core/OutputPort')
  , Fiber = require('fibers')
  , IP = require('../core/IP');

module.exports = function delay(runtime) {
  var proc = runtime.getCurrentProc();
  var inport = InputPort.openInputPort('IN');
  var intvlport = InputPort.openInputPort('INTVL');
  var outport = OutputPort.openOutputPort('OUT');
  var intvl_ip = intvlport.receive();
  var intvl = intvl_ip.contents;
  IP.drop(intvl_ip);

  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    runtime.setCallbackPending(true);
    sleep(runtime, proc, intvl);
    runtime.setCallbackPending(false);
    outport.send(ip);
  }
} 

function sleep(runtime, proc, ms) {
  console.log(proc.name + ' start sleep: ' + Math.round(ms * 100) / 100 + ' msecs');  
    var fiber = Fiber.current;
    setTimeout(function() {
        runtime.queueCallback(proc);
    }, ms);
    return Fiber.yield();
}
