'use strict';

module.exports = function delay(runtime) {
  //  var proc = fbp.getCurrentProc();
  var inport = this.openInputPort('IN');
  var intvlport = this.openInputPort('INTVL');
  var outport = this.openOutputPort('OUT');
  var intvl_ip = intvlport.receive();
  var intvl = intvl_ip.contents;
  this.dropIP(intvl_ip);

  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    //fbp.setCallbackPending(true);
    //console.log('start wait for ' + Math.round(intvl * 100) / 100 + ' msecs: ' + ip.contents);
    runtime.runAsyncCallback(genSleepFun(this, intvl));
    //var name = outport.name.substring(0, outport.name.indexOf("."));
    //console.log(name + ' end sleep ' );
    //fbp.setCallbackPending(false);
    outport.send(ip);
  }
};

function genSleepFun(proc, ms) {
  return function (done) {
    //console.log(proc.name + ' start sleep: ' + ms + ' msecs');

    setTimeout(function () {
      done();
    }, ms);
  };
}
