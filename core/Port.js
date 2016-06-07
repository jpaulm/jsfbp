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
  this._runtime = null;
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
    if (this._runtime) {
      this._conn.setRuntime(this._runtime);
    }
  }
});

Object.defineProperty(Port.prototype, 'runtime', {
  set: function (r) {
    this._runtime = r;
    if (this._conn) {
      this._conn.setRuntime(this._runtime);
    }
  }
});

Port.prototype.setRuntime = function (runtime) {
  this.runtime = runtime;
};


module.exports = Port;
