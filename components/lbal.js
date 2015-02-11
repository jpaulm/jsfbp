var fbp = require('..');

module.exports = function lbal() {
  var inport = fbp.InputPort.openInputPort('IN');
  var array = fbp.OutputPortArray.openOutputPortArray('OUT');

  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var i = fbp.getElementWithSmallestBacklog(array);
    array[i].send(ip);
  }
}
