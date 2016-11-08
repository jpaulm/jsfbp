'use strict';

module.exports = function discard() {
  var inport = this.openInputPort('IN');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    //var data = ip.contents;
    //console.log('data: ' + data);
    this.dropIP(ip);
  }
};
