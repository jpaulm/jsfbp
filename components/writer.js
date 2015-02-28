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

   var result = runtime.runAsyncCallback(myWriteFile(fname, string, "utf8", proc));
   console.log('write complete: ' + proc.name);
   if (result != null) {
     console.log(result);
     return;
   }
};

function myWriteFile(path, data, options, proc) {
  return function (done) {
    console.log('write started: ' + proc.name);
    fs.writeFile(path, data, options, function(err, data) {
      done(err);
    });
    console.log('write pending: ' + proc.name);
  };
}