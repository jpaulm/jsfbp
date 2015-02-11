var fbp = require('../..');

module.exports = function wssimproc() {
  var inport = fbp.InputPort.openInputPort('IN');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip == null) {
      break;
    }
    outport.send(ip);
    ip = inport.receive();
    outport.send(ip);      // connection
    ip = inport.receive();
    outport.send(fbp.IP.create('Frankie Tomatto'));
    outport.send(fbp.IP.create('Joe Fresh'));
    outport.send(fbp.IP.create('Aunt Jemima'));
    fbp.IP.drop(ip);
    ip = inport.receive();
    outport.send(ip);
  }
}
