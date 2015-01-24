var fbp = require('./fbp.js');

exports.receiver = function () {

    var inport = InputPort.openInputPort('IN'); 
    while (true) {            
      var ip = inport.receive();    
      if (ip == null)
        break; 
      var i = ip.contents;  
      console.log('data: ' + i); 
      IP.drop(ip);
    }
    
  }