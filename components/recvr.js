'use strict';

module.exports = function recvr() {
  var inport = this.openInputPort('IN');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    if (ip.type == this.IPTypes.OPEN)
      console.log('open');
    else if (ip.type == this.IPTypes.CLOSE)
      console.log('close');
    else
      console.log('data: ' + ip.contents);
    this.dropIP(ip);
  }
};
