'use strict';

/**
 * display has an optional output port
 */

module.exports = function display() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT', 'OPTIONAL');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var data = ip.contents;
    if (ip.type == this.IPTypes.OPEN)
      console.log('OPEN: ' + data);
    else if (ip.type == this.IPTypes.CLOSE)
      console.log('CLOSE: ' + data);
    else
      console.log('data: ' + data);
    outport.send(ip);
  }
};
