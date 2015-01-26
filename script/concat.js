var fbp = require('./fbp.js');

exports.concat = function () {
    
    var array = InputPortArray.openInputPortArray('IN');    
    var outport = OutputPort.openOutputPort('OUT');     
    var ip = null;
     
    for (var i = 0; i < array.length; i++) {
      while (true) {
       ip = array[i].receive();
       if (ip == null)
         break;
       outport.send(ip); 
     }                
    }
  }
  