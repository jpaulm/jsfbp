'use strict';

var Fiber = require('fibers')
  , fs = require('fs')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP');

module.exports = function writer(runtime) {
   var proc = runtime.getCurrentProc();
   var inport = InputPort.openInputPort('FILE');
   var dataport = InputPort.openInputPort('IN');
   var ip = inport.receive();
   var fname = ip.contents;
   IP.drop(ip);
   var string = '';
   while (true) {
      ip = dataport.receive();
      if (ip === null) {
        break;
      }
      string += ip.contents + '\n';
      IP.drop(ip);
   }

   runtime.setCallbackPending(true);
   var result = myWriteFile(runtime, fname, string, "utf8", proc);
   console.log('write complete: ' + proc.name);
   runtime.setCallbackPending(false);
   if (result != null) {
     console.log(result);
     return;
   }
};

function myWriteFile(runtime, path, data, options, proc) {
  console.log('write started: ' + proc.name);
  fs.writeFile(path, data, options, function(err, data) {
    console.log('running callback for: ' + proc.name);
    runtime.queueCallback(proc, err);
  });
  console.log('write pending: ' + proc.name);
  return Fiber.yield();
}