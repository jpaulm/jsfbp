'use strict';

var InputPort = require('../core/InputPort')
  , IP = require('../core/IP');

module.exports = function recvr() {
  var inport = InputPort.openInputPort('IN');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var data = ip.contents;
    console.log('data: ' + data);
    IP.drop(ip);
  }
}
