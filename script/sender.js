var fbp = require('./fbp.js');

exports.sender = function () {
    
    for (var i = 0; i < 100; i++) {
      var ip = new fbp.IP(i + ''); 
      fbp.send('OUT', ip);
    }
    fbp.close_out('OUT');    
  }
  
