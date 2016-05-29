'use strict';

module.exports = function concat() {
  var array = this.openInputPortArray('IN');
  var outport = this.openOutputPort('OUT');
  var ip = null;

  for (var i = 0; i < array.length; i++) {
    while (true) {
      ip = array[i].receive();
      if (ip === null) {
        break;
      }
      outport.send(ip);
    }
  }
};
