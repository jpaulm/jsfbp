var fbp = require('./fbp.js');

exports.repl = function () {
    var inport = InputPort.openInputPort('IN'); 
    //var count = fbp.outArrayLength('OUT');
    var opa = OutputPortArray.openOutputPortArray('OUT');
    var array = opa.array;
    
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
  