'use strict';

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

module.exports.findInputPortElementWithData = function(array){	  
	  var element = -1;
	  // if all elements closed, this will return -1
	  for (var i = 0; i < array.length; i++) {
	     if (array[i] == null || array[i] == undefined)
	        continue;
	     if (array[i].conn.usedslots > 0){	        
	        element = i;
	     }   
	  }
	  return element;
	};

module.exports.Enum = function (constants) {
  var _map = {};
  var enumTable = {
    __lookup: function (constantValue) {
      return _map[constantValue] || null;
    }
  };

  var counter = 1;
  constants.forEach(function (name) {
    if (name === '__lookup') {
      throw 'You must not specify a enum constant named "__lookUp"! This name is reserved for the lookup function.';
    }
    enumTable[name] = counter;
    _map[counter] = name;
    counter++;
  });

  return Object.freeze(enumTable);
};