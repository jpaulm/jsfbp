var fbp = require('./fbp.js');

exports.recvr = function () {

    var inport = InputPort.openInputPort('IN'); 
    while (true) {            
      var ip = inport.receive();    
      if (ip == null)
        break; 
      var data = ip.contents;  
      console.log('data: ' + data); 
      IP.drop(ip);
    }
    
  }