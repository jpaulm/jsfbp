'use strict';

var InputPortArray = require('../core/InputPortArray')
  , OutputPort = require('../core/OutputPort');

module.exports = function rrmerge() {
  var array = InputPortArray.openInputPortArray('IN');
  var outport = OutputPort.openOutputPort('OUT');
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