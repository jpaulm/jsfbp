var fbp = require('./fbp.js');
var Fiber = require('fibers');
var fbp = require('./fbp.js');

exports.randdelay = function () {
    //var fiber = Fiber.current;
    var proc = fbp.getCurrentProc();
    var inport = InputPort.openInputPort('IN'); 
    var outport = OutputPort.openOutputPort('OUT'); 
    while (true) {      
      var ip = inport.receive();         
      if (ip == null)
        break;   
      fbp.setCallbackPending(true);        
      sleep(proc, Math.random() * 400);   
                     
      outport.send(ip);
    }       
  }
  
  function sleep(proc, ms) {     
    //console.log('start sleep'); //var fiber = Fiber.current; 
    var id = setTimeout(function() {
        fbp.queueCallback(proc, null); 
        fbp.setCurrentProc(proc); 
        //console.log('end sleep');
        fbp.setCallbackPending(false);      
     //}); 
    }, ms);
    Fiber.yield();
}
  
 