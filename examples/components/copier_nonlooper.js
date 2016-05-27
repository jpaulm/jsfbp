'use strict';

//var InputPort = require('../core/InputPort')
//  , OutputPort = require('../core/OutputPort')

// same as copier, but written as a non-looper

// do service calls from internal subroutine

module.exports = function copier_nonlooper() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  //var ip = inport.receive();
  //var i = ip.contents;
  //outport.send(ip);
  subrtn(inport, outport);
};

function subrtn(inport, outport) {
  var ip = inport.receive();
  outport.send(ip);
}
