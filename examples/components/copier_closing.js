'use strict';

module.exports = function copier_closing() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  var count = 0;
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    count++;
    if (count === 20) {
      inport.close();
      this.dropIP(ip);
      return;
    }
    outport.send(ip);
  }
};
