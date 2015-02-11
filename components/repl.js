var fbp = require('..');

module.exports = function repl() {
  var inport = fbp.InputPort.openInputPort('IN');
  var array = fbp.OutputPortArray.openOutputPortArray('OUT');

  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    for (var i = 0; i < array.length; i++) {
      array[i].send(fbp.IP.create(ip.contents));
    }
    fbp.IP.drop(ip);
  }
}
