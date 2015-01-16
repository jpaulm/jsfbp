var fbp = require('./fbp.js');

exports.sender = function () {
    var ip = fbp.receive('COUNT');
    var count = ip.contents;
    //console.log(count);
    for (var i = 0; i < count; i++) {
      var ip = new fbp.IP(i + ''); 
      fbp.send('OUT', ip);
    }
    fbp.close_out('OUT');    
  }
  
