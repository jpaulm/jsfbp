var fbp = require('./fbp.js');
var fs = require('fs'); 

exports.reader = function () {   
     var proc = fbp.getProc();  
     console.log('read started');
     myReadFile('./readme.txt', "utf8", cb);
  }
  
  function myReadFile(path, options, cb) {
     var proc = fbp.getProc();
     fs.readFile(path, options, function(err, data) {
        cb(err, data, proc);
     });
  }
  
  function cb(err, data, proc) {
     console.log('callback');
     var ip = fbp.create(data); 
     fbp.send('OUT', ip);
     fbp.close_out('OUT'); 
     fbp.close();  
  }