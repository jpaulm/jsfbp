var fbp = require('./fbp.js');

exports.sender = function () {
    var inport = InputPort.openInputPort('COUNT'); 
    var outport = OutputPort.openOutputPort('OUT'); 
    var ip = inport.receive();
    var count = ip.contents;
    IP.drop(ip);
    //console.log(count);
    for (var i = 0; i < count; i++) {
      var ip = IP.create(i + ''); 
      if (-1 == outport.send(ip))
         return;;
    }
    
   
  }
  
