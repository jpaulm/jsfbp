var fbp = require('./fbp.js');
var fs = require('fs'); 

exports.reader = function () {   
     //var proc = fbp.getProc();  
     console.log('read started');
     fs.readFile('./readme.txt', "utf8", cb);
     console.log('read running');     
  }
     
  function cb(err, data) {
     console.log('read finished');     
     var ip = fbp.create(data); 
     fbp.send('OUT', ip);     
     fbp.close();  
  }