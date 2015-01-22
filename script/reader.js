var fbp = require('./fbp.js');
var fs = require('fs'); 
var proc;  

exports.reader = function () {   
     proc = fbp.getCurrentProc();  
     var ip = fbp.receive('FILE');
     var fname = ip.contents;
     fbp.drop(ip);
     //console.log('read started');
     myReadFile(fname, "utf8", callback);     
  }
  
  function myReadFile(path, options, cb) {
    //var fiber = Fiber.current;
    fs.readFile(path, options, function(err, data) {
      cb(err, data, proc);
    });
  }
   
  function callback(err, data, proc) {  
     fbp.setCurrentProc(proc);      
     var ip = fbp.create(data); 
     fbp.send('OUT', ip);     
     fbp.close();  
        
  }