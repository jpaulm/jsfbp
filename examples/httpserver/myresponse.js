'use strict';

module.exports = function myresp() {
  var ip;
  var inport = this.openInputPort('IN');

  while (true) {
    ip = inport.receive();   // shd be open bracket
    if (ip === null) {
      break;
    }
    this.dropIP(ip);
    ip = inport.receive();   // shd be response string
    var message = ip.contents;
    this.dropIP(ip);
    ip = inport.receive();   // shd be res object
    var res = ip.contents;
    this.dropIP(ip);
    res.end(message);
    ip = inport.receive();   // shd be close bracket
    this.dropIP(ip);
  }
};
