'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Port = function (process, portName) {
  EventEmitter.call(this);
  if (process) {
    this.processName = process.name;
    this.process = process;
  } else {
    this.processName = '';
  }
  this.portName = portName;
  this.closed = false;
};
util.inherits(Port, EventEmitter);


Object.defineProperty(Port.prototype, 'name', {
  get: function () {
    return this.processName + "." + this.portName;
  }
});

module.exports = Port;
