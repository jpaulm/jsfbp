'use strict';

var IP = require('../core/IP')

module.exports = function recvr() {
  var inport = this.openInputPort('IN');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    if (ip.type == IP.OPEN)
      console.log('open');
    else if (ip.type == IP.CLOSE)
      console.log('close');
    else
      console.log('data: ' + ip.contents);
    this.dropIP(ip);
  }
};
