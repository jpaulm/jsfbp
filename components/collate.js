'use strict';

var InputPort = require('../core/InputPort')
  , InputPortArray = require('../core/InputPortArray')
  , IP = require('../core/IP')
  , OutputPort = require('../core/OutputPort');

module.exports = function collate() {
  var ctlfields = InputPort.openInputPort('CTLFIELDS');
  var inportArray = InputPortArray.openInputPortArray('IN');
  var outport = OutputPort.openOutputPort('OUT');

  var ctlfieldsP = ctlfields.receive();
  IP.drop(ctlfieldsP);

  var fields = ctlfieldsP.contents.split(',').map(function(str) { return parseInt(str); });
  var totalFieldLength = fields.reduce(function(acc, n) { return acc + n; }, 0);

  var portCount = inportArray.length;
  var ips = [];
  inportArray.forEach(function(port, index) {
    ips[index] = port.receive();
    if (ips[index] === null) {
      portCount--;
    }
  });

  while (portCount) {
    var lowestIndex = 0;
    var lowestKey = "\uffff";
    ips.forEach(function(ip, portIndex) {
      if (ip !== null) {
        var key = ip.contents.substring(0, totalFieldLength);
        if (key < lowestKey) {
          lowestKey = key;
          lowestIndex = portIndex;
        }
      }
    });

    outport.send(ips[lowestIndex]);

    ips[lowestIndex] = inportArray[lowestIndex].receive();
    if (ips[lowestIndex] === null) {
      portCount--;
    }
  }
}