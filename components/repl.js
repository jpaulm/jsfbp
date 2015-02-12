'use strict';

var fbp = require('..')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
  , OutputPortArray = require('../core/OutputPortArray');

module.exports = function repl() {
  var inport = InputPort.openInputPort('IN');
  var array = OutputPortArray.openOutputPortArray('OUT');

  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    for (var i = 0; i < array.length; i++) {
      array[i].send(IP.create(ip.contents));
    }
    IP.drop(ip);
  }
}
