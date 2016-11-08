'use strict';

module.exports = function randdelay(runtime) {
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
    runtime.runAsyncCallback(genSleepFun(this, Math.random() * intvl));
    outport.send(ip);
  }
};

function genSleepFun(proc, ms) {
  return function (done) {
    //console.log(proc.name + ' start sleep: ' + Math.round(ms * 100) / 100 + ' msecs');

    setTimeout(function () {
      done();
    }, ms);
  };
}
