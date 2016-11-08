'use strict';

module.exports = function gendata() {
  var inport = this.openInputPort('COUNT');
  var outport = this.openOutputPort('OUT');
  var ip = inport.receive();
  var count = ip.contents;
  this.dropIP(ip);
  //console.log(count);
  for (var i = 0; i < count; i++) {
    ip = this.createIP(i + 'abcd');
    //console.log(outport);
    if (-1 == outport.send(ip)) {
      return;
    }
  }
};
