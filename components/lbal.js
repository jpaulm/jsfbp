'use strict';

var Utils = require('../core/Utils');
var IP = require('../core/IP')

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
       sel = Utils.getElementWithSmallestBacklog(array);
    }
    if (ip.type == IP.OPEN)
		substream_level ++;
	else if (ip.type == IP.CLOSE)
		substream_level --;
    
    array[sel].send(ip);
  }
};