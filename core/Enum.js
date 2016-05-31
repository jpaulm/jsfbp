module.exports = function (constants) {
  var _map = {};
  var enumTable = {
    __lookup: function (constantValue) {
      return _map[constantValue] || null;
    }
  };

  var counter = 1;
  constants.forEach(function (name) {
    if (name === '__lookup') {
      throw 'You must not specify a enum constant named "__lookup"! This name is reserved for the lookup function.';
    }
    enumTable[name] = counter;
    _map[counter] = name;
    counter++;
  });

  return Object.freeze(enumTable);
};
