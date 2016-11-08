'use strict';

/**
 * This testing component uses the first byte of each incoming IP to generate open or close
 * brackets, or "normal" data IPs; the real data starts at the second byte
 *
 */

module.exports = function gendatawithbreaks() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var c = ip.contents;
    this.dropIP(ip);
    var type = c.substring(0, 1);
    if (type == 'O')
      ip = this.createIPBracket(this.IPTypes.OPEN);
    else if (type == 'C')
      ip = this.createIPBracket(this.IPTypes.CLOSE);
    else {
      c = c.substring(1);
      ip = this.createIP(c);
    }
    outport.send(ip);
  }
};
