'use strict';

var IP = require('../../core/IP');

module.exports = function wschatresp() {
  var ip;
  var inport = this.openInputPort('IN');
  var wssin = this.openInputPort('WSSIN');

  ip = wssin.receive();      // shd be wss
  var wss = ip.contents;

  while (true) {
    ip = inport.receive();   // shd be open bracket
    if (ip === null) {
      break;
    }
    //console.log(ip);
    this.dropIP(ip);
    ip = inport.receive();   // shd be orig connection
    //console.log(ip);
    var ws = ip.contents;
    this.dropIP(ip);
    while (true) {
      ip = inport.receive();
      //console.log(ip);
      if (ip.type == IP.CLOSE) {
        this.dropIP(ip);
        break;
      }
      var msg = ip.contents;
      this.dropIP(ip);
      wss.clients.forEach(function(client) {
        client.send(msg);
      });
    }
  }
}
