'use strict';

var Utils = require('../core/Utils');

module.exports = function lbal() {
  var inport = this.openInputPort('IN');
  var array = this.openOutputPortArray('OUT');

  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var i = Utils.getElementWithSmallestBacklog(array);
    array[i].send(ip);
  }
};