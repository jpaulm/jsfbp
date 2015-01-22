var fbp = require('./fbp.js');

exports.sender = function () {
    var ip = fbp.receive('COUNT');
    var count = ip.contents;
    fbp.drop(ip);
    //console.log(count);
    for (var i = 0; i < count; i++) {
      var ip = fbp.create(i + ''); 
      fbp.send('OUT', ip);
    }
    
    fbp.close();    
  }
  
