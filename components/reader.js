'use strict';

var Fiber = require('fibers')
  , fs = require('fs')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
	, OutputPort = require('../core/OutputPort');

// Reader based on Bruno Jouhier's code
module.exports = function reader(runtime) {
  var proc = runtime.getCurrentProc();
  var inport = InputPort.openInputPort('FILE');
  var ip = inport.receive();
  var fname = ip.contents;
  IP.drop(ip);
  runtime.setCallbackPending(true);

  var data = myReadFile(runtime, fname, "utf8", proc);
  console.log('read complete: ' + proc.name);

  runtime.setCallbackPending(false);
  var outport = OutputPort.openOutputPort('OUT');
  var array = data.split('\n');
  for (var i = 0; i < array.length; i++) {
    var ip = IP.create(array[i]);
    outport.send(ip);
  }
};

function myReadFile(runtime, path, options, proc) {
  console.log('read started: ' + proc.name);
  fs.readFile(path, options, function(err, data) {
    console.log('callback for: ' + proc.name);
    runtime.queueCallback(proc, data);
  });
  console.log('read pending: ' + proc.name);
  return Fiber.yield();
}