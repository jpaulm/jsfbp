'use strict';

var Utils = require('../core/Utils');

module.exports = function lbal() {
  var inport = this.openInputPort('IN');
  var array = this.openOutputPortArray('OUT');
  var sel = -1;
  var substream_level = 0;
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }

    if (substream_level == 0) {
      sel = Utils.getElementWithSmallestBacklog(array, sel);
    }
    if (ip.type == this.IPTypes.OPEN)
      substream_level++;
    else if (ip.type == this.IPTypes.CLOSE)
      substream_level--;

    array[sel].send(ip);
  }
};
