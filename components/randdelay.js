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
    runtime.runAsyncCallback(genSleepFun(proc, Math.random() * intvl));
    outport.send(ip);
  }
};

function genSleepFun(proc, ms) {
  return function (done) {
    console.log(proc.name + ' start sleep: ' + Math.round(ms * 100) / 100 + ' msecs');
    
    setTimeout(function() {
      done();
    }, ms);
  };
}