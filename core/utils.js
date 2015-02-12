'use strict';

module.exports.InitConn = function(contents) {
  this.contents = contents;
  this.closed = false;       
};

module.exports.getElementWithSmallestBacklog = function(array){
  var number = Number.MAX_VALUE; 
  var element = 0;
  for (var i = 0; i < array.length; i++) {
     if (array[i] == null || array[i] == undefined)
        continue;
     if (number > array[i].conn.usedslots){
        number = array[i].conn.usedslots;
        element = i;
     }   
  }
  return element;
};