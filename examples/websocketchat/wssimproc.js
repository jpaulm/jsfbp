'use strict';

module.exports = function wssimproc() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip == null) {
      break;
    }
    // not null, so this IP was open bracket
    outport.send(ip);  //send it on
    ip = inport.receive();  // connection
    outport.send(ip);      // send it on
    ip = inport.receive(); // data IP - drop and emit modified message
    var name = "Anonymous";
    var text = ip.contents;
    var i = text.indexOf(":");
    if (i > -1) {
      name = text.substring(0, i);
      text = text.substring(i + 1);
    }
    this.dropIP(ip);
    outport.send(this.createIP(name + ' wrote:'));
    outport.send(this.createIP(text));
    ip = inport.receive(); // close bracket
    outport.send(ip);  // send it on...
  }
};
