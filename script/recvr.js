var fbp = require('./fbp.js');

exports.receiver = function () {

    while (true) {      
      var ip = fbp.receive('IN');     
      if (ip == null)
        break; 
      var i = ip.contents;  
      console.log(i); 
      fbp.drop(ip);
    }
    fbp.close();
  }