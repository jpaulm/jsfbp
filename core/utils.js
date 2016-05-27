'use strict';

var Fiber = require('fibers'),
  ProcessStatus = require('./Process').Status;

module.exports.getElementWithSmallestBacklog = function (array, elem) {
  var number = Number.MAX_VALUE;
  var element = elem;
  if (element == -1)
    element = 0;
  var j = element;
  for (var i = 0; i < array.length; i++) {
    if (array[j] == null || array[j] == undefined)
      continue;
    if (number > array[j].conn.usedslots) {
      number = array[j].conn.usedslots;
      element = j;
    }
    j = (j + 1) % array.length;
  }
  //console.log('element: ' + element + '(' + number + ')');
  return element;
};

module.exports.findInputPortElementWithData = function (array) {
  var proc = Fiber.current.fbpProc;

	if (tracing) {
    console.log(proc.name + ' findIPE_with_data ');
  }

  while (true) {
		var element = -1;
    var allDrained = true;
		for (var i = 0; i < array.length; i++) {
			if (array[i] == null || array[i] == undefined)
				continue;
			if (array[i].conn.usedslots > 0) {  // connection has data
				element = i;
				if (tracing) {
				    console.log(proc.name + ' findIPE_with_data - found: ' + i);
      }
				return i;			
      }
			else if (array[i].conn.closed)  { 	// connection is drained				
				continue;
      }
      else {
        allDrained = false;                  // no data but not all closed, so suspend
      }
    }
		if (allDrained) {
			if (tracing) {
        console.log(proc.name + ' findIPE_with_data: all drained');
      }
      return -1;
    }

    proc.status = ProcessStatus.WAITING_TO_FIPE;
    proc.yielded = true;
		if (tracing) {
      console.log(proc.name + ' findIPE_with_data: susp');
    }
    Fiber.yield();
    proc.status = ProcessStatus.ACTIVE;
    proc.yielded = false;
		if (tracing) {
      console.log(proc.name + ' findIPE_with_data: resume');
    }
  }
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
