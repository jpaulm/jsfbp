var fbp = require('..');

module.exports = function sender() {
  var inport = fbp.InputPort.openInputPort('COUNT');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  var ip = inport.receive();
  var count = ip.contents;
  fbp.IP.drop(ip);
  //console.log(count);
  for (var i = 0; i < count; i++) {
    var ip = fbp.IP.create(i + '');
    if (-1 == outport.send(ip)) {
      return;
    }
  }
}
