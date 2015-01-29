var fbp = require('./fbp.js');

exports.copier_closing = function () {
    var inport = InputPort.openInputPort('IN'); 
    var outport = OutputPort.openOutputPort('OUT'); 
    var count = 0;
    while (true) {      
      var ip = inport.receive();         
      if (ip == null)
        break;
      count++;
      if (count == 20) {
        inport.close();
        IP.drop(ip);
        return;
      }
      var i = ip.contents; 
      outport.send(ip);
    }
    
   
  }
  