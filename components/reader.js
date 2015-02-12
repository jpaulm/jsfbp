'use strict';

var fbp = require('..')
  , Fiber = require('fibers')
  , fs = require('fs')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
	, OutputPort = require('../core/OutputPort');

// Reader based on Bruno Jouhier's code
module.exports = function reader() {
  var proc = fbp.getCurrentProc();
  var inport = InputPort.openInputPort('FILE');
  var ip = inport.receive();
  var fname = ip.contents;
  IP.drop(ip);
  fbp.setCallbackPending(true);

  var data = myReadFile(fname, "utf8", proc);
  console.log('read complete: ' + proc.name);

  fbp.setCallbackPending(false);
  var outport = OutputPort.openOutputPort('OUT');
  var array = data.split('\n');
  for (var i = 0; i < array.length; i++) {
    var ip = IP.create(array[i]);
    outport.send(ip);
  }
}

function myReadFile(path, options, proc) {
  console.log('read started: ' + proc.name);
  fs.readFile(path, options, function(err, data) {
    // fbp.setCurrentProc(proc);
    console.log('callback for: ' + proc.name);
    fbp.queueCallback(proc, data);
    // fiber.run(data);
  });
  console.log('read pending: ' + proc.name);
  // console.log('yielded: ' + proc.name );
  return Fiber.yield();
}
