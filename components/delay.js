'use strict';

var InputPort = require('../core/InputPort')
  , OutputPort = require('../core/OutputPort')
  , fbp = require('..')
  , Fiber = require('fibers')
  , IP = require('../core/IP');

module.exports = function delay() {
  var proc = fbp.getCurrentProc();
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
    fbp.setCallbackPending(true);
    console.log('start wait for ' + Math.round(intvl * 100) / 100 + ' msecs: ' + ip.contents);
    sleep(proc, intvl);
    fbp.setCallbackPending(false);
    outport.send(ip);
  }
} 

function sleep(proc, ms) {
    // console.log(proc.name + ' start sleep: ' + Math.round(ms * 100) / 100 + ' msecs');  
    var fiber = Fiber.current;
    setTimeout(function() {
        console.log('end wait for ' + Math.round(ms * 100) / 100 + ' msecs');
        fbp.queueCallback(proc);
    }, ms);
    return Fiber.yield();
}
