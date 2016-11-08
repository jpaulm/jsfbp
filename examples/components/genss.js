'use strict';

// generate substreams of length 5
module.exports = function genss() {
  var inport = this.openInputPort('COUNT');
  var outport = this.openOutputPort('OUT');
  var ip = inport.receive();
  var count = ip.contents;
  this.dropIP(ip);
  //console.log(count);
  var p = this.createIPBracket(this.IPTypes.OPEN);
  outport.send(p);

  for (var i = 0; i < count; i++) {
    ip = this.createIP((count - i) + 'abcd');
    if (-1 == outport.send(ip)) {
      return;
    }
    if (i < count - 1) {
      if (i % 5 == 5 - 1) {
        p = this.createIPBracket(this.IPTypes.CLOSE);
        outport.send(p);

        p = this.createIPBracket(this.IPTypes.OPEN);
        outport.send(p);
      }
    }
  }
  p = this.createIPBracket(this.IPTypes.CLOSE);
  outport.send(p);
};
