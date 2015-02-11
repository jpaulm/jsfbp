'use strict';

var Fiber = require('fibers');

var InputPortArray = module.exports = {};

InputPortArray.openInputPortArray = function(name) {
   var proc = Fiber.current.fbpProc; 
   var namey = proc.name + '.' + name;
   var hi_index = -1;  
   var array = new Array();
   
   var re = new RegExp(namey + '\\[(\\d+)\\]');  
   
   for (var i = 0; i < proc.inports.length; i++) {   
     var namex = re.exec(proc.inports[i][0]);   
     
     if (namex != null && namex.index == 0) {
        hi_index = Math.max(hi_index, namex[1]);
        array[namex[1]] = proc.inports[i][1];
     }     
   }
   if (hi_index == -1){
   console.log('Port ' + proc.name + '.' + name + ' not found');
     return null; 
   }
  
   return array; 
}