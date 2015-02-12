var fbp = require('..');

module.exports = function concat() {
  var array = fbp.InputPortArray.openInputPortArray('IN');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  var ip = null;

  for (var i = 0; i < array.length; i++) {
    while (true) {
      ip = array[i].receive();
      if (ip === null) {
        break;
      }
      outport.send(ip);
    }
  }
}
