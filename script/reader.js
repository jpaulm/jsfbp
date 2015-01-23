var fbp = require('./fbp.js');
var fs = require('fs'); 
 

exports.reader = function () {   
     var proc = fbp.getCurrentProc();  
     var ip = fbp.receive('FILE');
     var fname = ip.contents;
     fbp.drop(ip);
     //console.log('read started');
     myReadFile(fname, "utf8");     
  }
  
  function myReadFile(path, options) {
    //console.log(proc.name + ' started reading');
    fs.readFile(path, options, function(err, data) {
     var savedata = data;
     var saveerr = err; 
     //console.log(proc.name + ' started processing');
     fbp.setProcCallback(proc, function()
     {       
       var array = savedata.split('\n');
       for (var i = 0; i < array.length; i++) {
         var ip = fbp.create(array[i]); 
         fbp.send('OUT', ip);   
       }  
       fbp.close(); 
     }); 
        
  }