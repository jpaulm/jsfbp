'use strict';

var fbp = require('..')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
  , OutputPort = require('../core/OutputPort');

module.exports = function sender() {
  var inport = InputPort.openInputPort('PARMS');
  var outport = OutputPort.openOutputPort('OUT');
  var ip = inport.receive();
  var parms = ip.contents;
  var parmsarray = parms.split(',');  // increment, suffix, count
  IP.drop(ip);
  //console.log(count);
  var value = 0;
  for (var i = 0; i < parmsarray[2]; i++) {
    value += Number(parmsarray[0]);
    var ip = IP.create(value + ' ' + parmsarray[1] );
    if (-1 == outport.send(ip)) {
      return;
    }
  }
};