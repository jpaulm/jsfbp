var InputPort = require('../../core/InputPort')
  , IP = require('../../core/IP');

module.exports = function wsresp() {
  var ip;
  var inport = InputPort.openInputPort('IN');
  while (true) {
    ip = inport.receive();   // shd be open bracket
    if (ip === null) {
      break;
    }
    //console.log(ip);
    IP.drop(ip);
    ip = inport.receive();   // shd be connection
    //console.log(ip);
    var ws = ip.contents;
    IP.drop(ip);
    while (true) {
      ip = inport.receive();
      //console.log(ip);
      if (ip.type == IP.CLOSE) {
        IP.drop(ip);
        break;
      }
      var msg = ip.contents;
      IP.drop(ip);
      ws.send(msg);
    }
  }
}
