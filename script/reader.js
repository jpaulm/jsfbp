var fbp = require('./fbp.js');
var fs = require('fs'); 
 

exports.reader = function () {   
     var proc = fbp.getCurrentProc();  
     var ip = fbp.receive('FILE');
     var fname = ip.contents;
     fbp.drop(ip);
     fbp.setCallbackPending(true); 
     myReadFile(fname, "utf8", proc);     
  }
  
  function myReadFile(path, options, proc) {
    //console.log(proc.name + ' started reading');
    fs.readFile(path, options, function(err, data) {
     var savedata = data;
     var saveerr = err;      
     fbp.setProcCallback(proc, function(){  
     fbp.setCallbackPending(false);     
       var array = savedata.split('\n');
       for (var i = 0; i < array.length; i++) {
         var ip = fbp.create(array[i]); 
         fbp.send('OUT', ip);   
       } 
    }); 
    });
  }    
 