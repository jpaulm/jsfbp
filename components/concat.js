'use strict';

var InputPortArray = require('../core/InputPortArray')
  , OutputPort = require('../core/OutputPort');

module.exports = function concat() {
  var array = InputPortArray.openInputPortArray('IN');
  var outport = OutputPort.openOutputPort('OUT');
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