var fbp = require('./fbp.js');
var fs = require('fs'); 

exports.reader = function () {   
     var proc = fbp.getProc();  
     console.log('read started');
     fs.readFile('./readme.txt', "utf8", cb);
  }
     
  function cb(err, data, proc) {
     console.log('callback');
     var ip = fbp.create(data); 
     fbp.send('OUT', ip);     
     fbp.close();  
  }