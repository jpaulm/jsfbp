'use strict';

var fbp = require('..')
  , Fiber = require('fibers')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
  , OutputPort = require('../core/OutputPort');

module.exports = function randdelay() {
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
    sleep(proc, Math.random() * intvl);
    fbp.setCallbackPending(false);
    outport.send(ip);
  }
};

function sleep(proc, ms) {
  console.log(proc.name + ' start sleep: ' + ms + ' msecs');
  return setTimeout(function() {}, ms);
}