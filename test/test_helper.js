'use strict';

var chai = require('chai');

global.expect = chai.expect;

var InputPort = require('../core/InputPort')
  , InputPortArray = require('../core/InputPortArray')
  , OutputPort = require('../core/OutputPort')
  , OutputPortArray = require('../core/OutputPortArray')
  , IP = require('../core/IP');


global.MockSender = function(inputArray) {
  return function() {
    var outport = OutputPort.openOutputPort('OUT');
    inputArray.forEach(function(item) {
      outport.send(IP.create(item));
    });
  }
}

global.MockReceiver = function(outputArray) {
  return function() {
    var inport = InputPort.openInputPort('IN');
    var ip;
    while ((ip = inport.receive()) !== null) {
      outputArray.push(ip.contents);
      IP.drop(ip);
    }
  }
}
