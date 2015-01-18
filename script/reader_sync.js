var fbp = require('./fbp.js');
var fs = require('fs'); 

exports.reader = function () {
  
    var data = fs.readFileSync('./readme.txt', 'utf8');
    console.log(data);   
    var ip = fbp.create(data); 
    fbp.send('OUT', ip);
    fbp.close_out('OUT');           
    fbp.close();   
    
  }
  
