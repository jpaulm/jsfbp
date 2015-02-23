'use strict';

var Fiber = require('fibers')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
  , OutputPort = require('../core/OutputPort');

module.exports = function randdelay(runtime) {
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
    sleep(runtime, proc, Math.random() * intvl);
    runtime.setCallbackPending(false);
    outport.send(ip);
  }
};

function sleep(runtime, proc, ms) {
  console.log(proc.name + ' start sleep: ' + Math.round(ms * 100) / 100 + ' msecs');  
  var fiber = Fiber.current;
  setTimeout(function() {
    proc.yielded = false;
    runtime.queueCallback(proc);
  }, ms);
  proc.yielded = true;
  return Fiber.yield();
}