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
    ip = inport.receive(); // data IP - drop and emit 3 results
    this.dropIP(ip);
    outport.send(this.createIP('Frankie Tomatto'));
    outport.send(this.createIP('Joe Fresh'));
    outport.send(this.createIP('Aunt Jemima'));    
    ip = inport.receive(); // close bracket
    outport.send(ip);  // send it on...
  }
}
