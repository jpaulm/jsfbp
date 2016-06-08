'use strict';

module.exports = function repl() {
  var inport = this.openInputPort('IN');
  var array = this.openOutputPortArray('OUT');

  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    for (var i = 0; i < array.length; i++) {
      if (ip.type === this.IPTypes.NORMAL) {
        array[i].send(this.createIP(ip.contents));
      } else {
        array[i].send(this.createIPBracket(ip.type, ip.contents));
      }
    }
    this.dropIP(ip);
  }
};
