var fbp = require('./fbp.js');

exports.copier = function () {
    var inport = InputPort.openInputPort('IN'); 
    var outport = OutputPort.openOutputPort('OUT'); 
    while (true) {      
      var ip = inport.receive();         
      if (ip == null)
        break;
      var i = ip.contents; 
      outport.send(ip);
    }
    
   
  }
  