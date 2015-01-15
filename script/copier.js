var fbp = require('./fbp.js');

exports.copier = function () {
    while (true) {      
      var ip = fbp.receive('IN');         
      if (ip == null)
        break;
      var i = ip.contents; 
      fbp.send('OUT', ip);
    }
    fbp.close_out('OUT');    
  }
  