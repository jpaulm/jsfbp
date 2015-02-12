var fbp = require('..');
var Fiber = require('fibers');

module.exports = function randdelay() {
  var proc = fbp.getCurrentProc();
  var inport = fbp.InputPort.openInputPort('IN');
  var intvlport = fbp.InputPort.openInputPort('INTVL');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  var intvl_ip = intvlport.receive();
  var intvl = intvl_ip.contents;
  fbp.IP.drop(intvl_ip);
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    fbp.setCallbackPending(true);
    sleep(proc, Math.random() * intvl);
    fbp.setCallbackPending(false);
    outport.send(ip);
  }
}

function sleep(proc, ms) {
  console.log(proc.name + ' start sleep: ' + ms + ' msecs');
  return setTimeout(function() {
  }, ms);
}
