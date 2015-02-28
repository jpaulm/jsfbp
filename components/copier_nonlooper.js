'use strict';

// same as copier, but written as a non-looper

module.exports = function copier_nonlooper() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  var ip = inport.receive();
  var i = ip.contents;
  outport.send(ip);
};