var fbp = require('..');
var Fiber = require('fibers');
var fs = require('fs');

module.exports = function writer() {
   var proc = fbp.getCurrentProc();
   var inport = fbp.InputPort.openInputPort('FILE');
   var dataport = fbp.InputPort.openInputPort('IN');
   var ip = inport.receive();
   var fname = ip.contents;
   fbp.IP.drop(ip);
   var string = '';
   while (true) {
      ip = dataport.receive();
      if (ip === null) {
        break;
      }
      string += ip.contents + '\n';
      fbp.IP.drop(ip);
   }
   fbp.setCallbackPending(true);
   myWriteFile(fname, string, "utf8", proc);
   console.log('write complete: ' + proc.name);
   fbp.setCallbackPending(false);
}

function myWriteFile(path, data, options, proc) {
  console.log('write started: ' + proc.name);
  fs.writeFile(path, data, options, function(err, data) {
    //fbp.setCurrentProc(proc);
    console.log('running callback for: ' + proc.name);
    fbp.queueCallback(proc);
    //fiber.run();
     });
  console.log('write pending: ' + proc.name);
 //console.log('yielded: ' + proc.name );
  return Fiber.yield();
}
