var fbp = require('../..');

module.exports = function wsresp() {
  var ip;
  var inport = fbp.InputPort.openInputPort('IN');
  while (true) {
    ip = inport.receive();   // shd be open bracket
    if (ip === null) {
      break;
    }
    //console.log(ip);
    fbp.IP.drop(ip);
    ip = inport.receive();   // shd be connection
    //console.log(ip);
    var ws = ip.contents;
    fbp.IP.drop(ip);
    while (true) {
      ip = inport.receive();
      //console.log(ip);
      if (ip.type == fbp.IP.CLOSE) {
        fbp.IP.drop(ip);
        break;
      }
      var msg = ip.contents;
      fbp.IP.drop(ip);
      ws.send(msg);
    }
  }
}
