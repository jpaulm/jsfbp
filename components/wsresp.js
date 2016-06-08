'use strict';

module.exports = function wsresp() {
  var ip;
  var inport = this.openInputPort('IN');
  while (true) {
    ip = inport.receive(); // shd be open bracket
    if (ip === null) {
      break;
    }
    //console.log(ip);
    this.dropIP(ip);
    ip = inport.receive(); // shd be connection
    //console.log(ip);
    var ws = ip.contents;
    this.dropIP(ip);
    while (true) {
      ip = inport.receive();
      //console.log(ip);
      if (ip.type == this.IPTypes.CLOSE) {
        this.dropIP(ip);
        break;
      }
      var msg = ip.contents;
      this.dropIP(ip);
      ws.send(msg);
    }
  }
};
