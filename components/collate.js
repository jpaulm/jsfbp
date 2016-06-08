'use strict';

/**
 * This component collates 1 to n input streams based on some number of contiguous key values; it
 * assumes all incoming streams are sorted on the same keys, in ascending order
 * The keys start in the first byte of each incoming IP
 * Key lengths are specified in the CTLFIELDS IIP, separated by commas
 *
 */

module.exports = function collate() {
  var ctlfieldsPort = this.openInputPort('CTLFIELDS');
  var inportArray = this.openInputPortArray('IN');
  var outport = this.openOutputPort('OUT');

  var ctlfieldsIP = ctlfieldsPort.receive();
  var ctlfields = ctlfieldsIP.contents.split(',');
  var ctlfieldlens = ctlfields.map(function (str) {
    return parseInt(str);
  });
  var prev = null;
  var hold = null;

  this.dropIP(ctlfieldsIP);

  var totalFieldLength = ctlfieldlens.reduce(function (acc, n) {
    return acc + n;
  }, 0);

  var portCount = inportArray.length;
  var ips = [];

  inportArray.forEach(function (port, index) {
    ips[index] = port.receive();
    if (ips[index] === null) {
      portCount--;
    }
  });

  for (var i = 0; i < ctlfields.length; i++) {
    var p = this.createIPBracket(this.IPTypes.OPEN);
    outport.send(p);
  }

  while (portCount) {
    var lowestIndex = 0;
    hold = "\uffff";
    ips.forEach(function (ip, portIndex) {
      if (ip !== null) {
        var key = ip.contents.substring(0, totalFieldLength);
        if (key < hold) {
          lowestIndex = portIndex;
          hold = key;
        }
      }
    });

    sendOutput(lowestIndex, this);

    ips[lowestIndex] = inportArray[lowestIndex].receive();
    if (ips[lowestIndex] === null) {
      portCount--;
    }
  }

  ctlfields.forEach(function () {
    var p = this.createIPBracket(this.IPTypes.CLOSE);
    outport.send(p);
  }.bind(this));


  function sendOutput(x, proc) {
    if (prev != null) {
      var level = findLevel();
      for (i = 0; i < level; i++) {
        var p2 = proc.createIPBracket(proc.IPTypes.CLOSE);
        outport.send(p2);
      }
      for (i = 0; i < level; i++) {
        p2 = proc.createIPBracket(proc.IPTypes.OPEN);
        outport.send(p2);
      }
    }
    outport.send(ips[x]);
    prev = hold;
  }

  function findLevel() {
    var j = 0;
    //console.log(ctlfields);
    for (var i = 0; i < ctlfields.length; i++) {
      var h1 = hold.substring(j, j + ctlfieldlens[i]);
      var p1 = prev.substring(j, j + ctlfieldlens[i]);
      //console.log(h1 + ':' + p1);
      if (h1.localeCompare(p1) != 0) {
        return ctlfields.length - i;
      }
      j += ctlfieldlens[i];
    }
    return 0;
  }
};
