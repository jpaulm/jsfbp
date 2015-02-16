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

  var result = myReadFile(fname, "utf8", proc);
  console.log('read complete: ' + proc.name);
  fbp.setCallbackPending(false);
  //console.log(result);
  if (result[0] == undefined) {
     console.log(result[1]);
     return;  
  }     

  var outport = OutputPort.openOutputPort('OUT');
  var array = result[0].split('\n');
  //console.log(array);
  for (var i = 0; i < array.length; i++) {
    var ip = IP.create(array[i]);
    outport.send(ip);
  }
};

function myReadFile(path, options, proc) {
  console.log('read started: ' + proc.name);
  fs.readFile(path, options, function(err, data) {
    console.log('running callback for: ' + proc.name);
    var res = [data, err];
    fbp.queueCallback(proc, res);
  });
  console.log('read pending: ' + proc.name);
  return Fiber.yield();
}