var InputPort = require('../core/InputPort')
  , OutputPort = require('../core/OutputPort');

module.exports = function copier() {
  var inport = InputPort.openInputPort('IN');
  var outport = OutputPort.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var i = ip.contents;
    outport.send(ip);
  }
}
