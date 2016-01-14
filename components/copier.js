'use strict';

module.exports = function copier() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    //var c = ip.contents;
    outport.send(ip);
  }
};