var fbp = require('./fbp.js');
var fs = require('fs'); 
 

exports.reader = function () {   
     var proc = fbp.getCurrentProc();  
     var inport = InputPort.openInputPort('FILE'); 
     var ip = inport.receive();
     var fname = ip.contents;
     IP.drop(ip);
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
        var outport = OutputPort.openOutputPort('OUT'); 
        var array = savedata.split('\n');
        for (var i = 0; i < array.length; i++) {
          var ip = IP.create(array[i]); 
          outport.send(ip);           
        } 
       }); 
    });
  }    
 