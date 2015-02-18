'use strict';

var chai = require('chai');

var InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
  , OutputPort = require('../core/OutputPort');

global.expect = chai.expect;

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
