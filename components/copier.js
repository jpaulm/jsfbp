var fbp = require('..');

module.exports = function copier() {
  var inport = fbp.InputPort.openInputPort('IN');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip == null) {
      break;
    }
    var i = ip.contents;
    outport.send(ip);
  }
}
