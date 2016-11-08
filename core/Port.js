'use strict';

var Port = function (process, portName) {
  if (process) {
    this.processName = process.name;
  } else {
    this.processName = '';
  }
  this.portName = portName;
  this.closed = false;
  this._conn = null;
};

Object.defineProperty(Port.prototype, 'name', {
  get: function () {
    return this.processName + "." + this.portName;
  }
});

Object.defineProperty(Port.prototype, 'conn', {
  get: function () {
    return this._conn;
  },
  set: function (c) {
    this._conn = c;
  }
});




module.exports = Port;
