var fbp = require('..');

// same as copier, but written as a non-looper

module.exports = function copier_nonlooper() {
  var inport = fbp.InputPort.openInputPort('IN');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  // while (true) {
    var ip = inport.receive();
    // if (ip == null) {
    //   break;
    // }
    var i = ip.contents;
    outport.send(ip);
  // }
}
