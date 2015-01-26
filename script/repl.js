var fbp = require('./fbp.js');

exports.repl = function () {
    var inport = InputPort.openInputPort('IN');     
    var array = OutputPortArray.openOutputPortArray('OUT');    
    
    while (true) {      
      var ip = inport.receive();         
      if (ip == null)
        break;
      for (var i = 0; i < array.length; i++) {
         array[i].send(IP.create(ip.contents));
      }
      IP.drop(ip);
    }
    
   
  }
  