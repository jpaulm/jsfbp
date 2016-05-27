'use strict';

module.exports = function myproc() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip == null) {
      break;
    }
    // not null, so this IP was open bracket
    outport.send(ip);  //send it on
    ip = inport.receive();  // request
    var req = ip.contents;
    this.dropIP(ip);
    outport.send(this.createIP('Response from URL: ' + req.url + '\n'));
    ip = inport.receive();  // res
    outport.send(ip);      // send it on
    ip = inport.receive(); // close bracket
    outport.send(ip);  // send it on...
  }
};
