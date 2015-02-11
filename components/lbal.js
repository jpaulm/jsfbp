var InputPort = require('../core/InputPort')
  , OutputPortArray = require('../core/OutputPortArray')
  , Utils = require('../core/Utils');

module.exports = function lbal() {
  var inport = InputPort.openInputPort('IN');
  var array = OutputPortArray.openOutputPortArray('OUT');

  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var i = Utils.getElementWithSmallestBacklog(array);
    array[i].send(ip);
  }
}
