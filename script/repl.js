var fbp = require('./fbp.js');

exports.repl = function () {
    var count = fbp.outArrayLength('OUT');
    while (true) {      
      var ip = fbp.receive('IN');         
      if (ip == null)
        break;
      for (var i = 0; i < count; i++) {
         fbp.send('OUT[' + i + ']', fbp.create(ip.contents));
      }
      fbp.drop(ip);
    }
    
   fbp.close();    
  }
  