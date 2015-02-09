var fbp = require('..');

module.exports = function recvr() {
  var inport = fbp.InputPort.openInputPort('IN');
  while (true) {
    var ip = inport.receive();
    if (ip == null) {
      break;
    }
    var data = ip.contents;
    console.log('data: ' + data);
    fbp.IP.drop(ip);
  }
}
