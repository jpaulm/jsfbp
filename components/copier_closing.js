var fbp = require('..');

module.exports = function copier_closing() {
  var inport = fbp.InputPort.openInputPort('IN');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  var count = 0;
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    count++;
    if (count === 20) {
      inport.close();
      fbp.IP.drop(ip);
      return;
    }
    var i = ip.contents;
    outport.send(ip);
  }
}
