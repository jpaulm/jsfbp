'use strict';

var Port = require('./Port');
var Fiber = require('fibers');

var InputPort = function (process, port) {
  this.parent.constructor.call(this, process, port);

  if (process) {
    process.addInputPort(this);
  } else {
    console.log("No process passed to input port: " + port);
  }
};

InputPort.prototype = Object.create(Port.prototype);
InputPort.prototype.constructor = InputPort;
InputPort.prototype.parent = Port.prototype;

InputPort.prototype.receive = function () {
  if (this.closed) {
    return null;
  }

  this.emit("ipRequested", {
    portName: this.name
  });
  return Fiber.yield();
};

InputPort.prototype.close = function () {
  var conn = this.conn;
  conn.closeFromInPort();
  this.closed = true;

};


module.exports = InputPort;
