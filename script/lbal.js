var fbp = require('./fbp.js');

exports.lbal = function () {
    var inport = InputPort.openInputPort('IN');     
    var array = OutputPortArray.openOutputPortArray('OUT');    
    
    while (true) {      
      var ip = inport.receive();         
      if (ip == null)
        break;
      var i = fbp.getElementWithSmallestBacklog(array); 
      array[i].send(ip);    
    }
    
   
  }
  