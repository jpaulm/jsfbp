'use strict';

var Fiber = require('fibers'),
  ProcessStatus = require('./Process').Status,
  trace = require('./trace');

function getInportWithData(inportArray) {
  var allDrained = true;

  var inportElementWithData = inportArray.findIndex(function (inport) {
    var conn = inport ? inport.conn : false;
    if (!conn) {
      return false;
    }
    else if (conn.usedslots > 0) {  // connection has data
      return true;
    }

    allDrained = allDrained && conn.closed;  // no data but not all closed, so suspend
    return false;
  });

  if (inportElementWithData >= 0) {
    trace('findIPE_with_data - found: ' + inportElementWithData);
  }
  else if(allDrained) {
    trace('findIPE_with_data: all drained');
  } else {
    inportElementWithData = null;
  }

  return {
    inportElementWithData: inportElementWithData,
    allDrained: allDrained
  };
}

module.exports.getElementWithSmallestBacklog = function (array, elem) {
  var number = Number.MAX_VALUE;
  var element = elem;
  if (element == -1) {
    element = 0;
  }
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
  return element;
};

module.exports.findInputPortElementWithData = function (array) {
  var proc = Fiber.current.fbpProc;

  trace('findIPE_with_data ');

  while (true) {
    var inportWitData = getInportWithData(array);

    if(inportWitData.inportElementWithData  !== null) {
      return inportWitData.inportElementWithData;
    }

    proc.yield(ProcessStatus.WAITING_TO_FIPE);
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
