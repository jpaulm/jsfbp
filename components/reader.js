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
  
  var result = runtime.runAsyncCallback(myReadFile(fname, "utf8", proc));
  
  console.log('read complete: ' + proc.name);

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
  return function (done) {
    console.log('read started: ' + proc.name);
    fs.readFile(path, options, function(err, data) {
      done([data, err]);
    });
    console.log('read pending: ' + proc.name);
  };
}