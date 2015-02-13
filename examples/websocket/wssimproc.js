var InputPort = require('../../core/InputPort')
  , IP = require('../../core/IP')
  , OutputPort = require('../../core/OutputPort');

module.exports = function wssimproc() {
  var inport = InputPort.openInputPort('IN');
  var outport = OutputPort.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip == null) {
      break;
    }
    outport.send(ip);
    ip = inport.receive();
    outport.send(ip);      // connection
    ip = inport.receive();
    outport.send(IP.create('Frankie Tomatto'));
    outport.send(IP.create('Joe Fresh'));
    outport.send(IP.create('Aunt Jemima'));
    IP.drop(ip);
    ip = inport.receive();
    outport.send(ip);
  }
}
