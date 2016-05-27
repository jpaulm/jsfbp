'use strict';

module.exports = function rrmerge() {
  var array = this.openInputPortArray('IN');
  var outport = this.openOutputPort('OUT');
  var ip = null;
  while (true) {
    for (var i = 0; i < array.length; i++) {
      ip = array[i].receive();
      if (ip !== null) {
        outport.send(ip);
      }
    }
    if (ip === null) {
      break;
    }
  }
};
