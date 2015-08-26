'use strict';

module.exports = function collate() {
  var ctlfields = this.openInputPort('CTLFIELDS');
  var inportArray = this.openInputPortArray('IN');
  var outport = this.openOutputPort('OUT');

  var ctlfieldsP = ctlfields.receive();
  var fields = ctlfieldsP.contents.split(',').map(function(str) { return parseInt(str); });
  this.dropIP(ctlfieldsP);

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
