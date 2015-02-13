var chai = require('chai');

global.expect = chai.expect;
global.fbp = require('..');

global.MockSender = function(inputArray) {
  return function() {
    var outport = fbp.OutputPort.openOutputPort('OUT');
    inputArray.forEach(function(item) {
      outport.send(fbp.IP.create(item));
    });
  }
}

global.MockReceiver = function(outputArray) {
  return function() {
    var inport = fbp.InputPort.openInputPort('IN');
    var ip;
    while ((ip = inport.receive()) !== null) {
      outputArray.push(ip.contents);
      fbp.IP.drop(ip);
    }
  }
}
