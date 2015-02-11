var fbp = require('..');

module.exports = function rrmerge() {
  var array = fbp.InputPortArray.openInputPortArray('IN');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  var ip = null;
  while (true) {
    for (var i = 0; i < array.length; i++) {
      ip = array[i].receive();
      if (ip !== null) {
        outport.send(ip);
      }
    }
    if (ip === null) {
      break;
    }
  }
}
