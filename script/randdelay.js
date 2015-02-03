var fbp = require('./fbp.js');
var Fiber = require('fibers');
var fbp = require('./fbp.js');

exports.randdelay = function () {
    //var fiber = Fiber.current;
    var proc = fbp.getCurrentProc();
    var inport = InputPort.openInputPort('IN'); 
    var intvlport = InputPort.openInputPort('INTVL'); 
    var outport = OutputPort.openOutputPort('OUT'); 
    var intvl_ip = intvlport.receive();
    var intvl = intvl_ip.contents;
    IP.drop(intvl_ip);
    while (true) {      
      var ip = inport.receive();         
      if (ip == null)
        break;   
      fbp.setCallbackPending(true);        
      sleep(proc, Math.random() * intvl);   
      fbp.setCallbackPending(false);                     
      outport.send(ip);
    }       
  }
  
  function sleep(proc, ms) {     
    console.log(proc.name + ' start sleep: ' + ms + ' msecs'); 
    return setTimeout(function() {     
       fbp.setCurrentProc(proc);            
       }, ms);  
}
  
 