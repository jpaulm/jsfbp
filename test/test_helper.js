'use strict';

var chai = require('chai');

global.expect = chai.expect;

global.MockSender = function(inputArray) {
  return function() {
    var outport = this.openOutputPort('OUT');
    var proc = this;
    inputArray.forEach(function(item) {
      outport.send(proc.createIP(item));
    });
  }
}

global.MockReceiver = function(outputArray) {
  return function() {
    var inport = this.openInputPort('IN');
    var ip;
    while ((ip = inport.receive()) !== null) {
      outputArray.push(ip.contents);
      this.dropIP(ip);
    }
  }
}
