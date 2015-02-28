'use strict';

module.exports = function wssimproc() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip == null) {
      break;
    }
    outport.send(ip);
    ip = inport.receive();
    outport.send(ip);      // connection
    ip = inport.receive();
    outport.send(this.createIP('Frankie Tomatto'));
    outport.send(this.createIP('Joe Fresh'));
    outport.send(this.createIP('Aunt Jemima'));
    this.dropIP(ip);
    ip = inport.receive();
    outport.send(ip);
  }
}
