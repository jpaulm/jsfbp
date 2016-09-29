'use strict';

var Port = require('./Port');
var Fiber = require('fibers');


var OutputPort = function (process, port) {
  this.parent.constructor.call(this, process, port);
  process.addOutputPort(this);
};

OutputPort.prototype = Object.create(Port.prototype);
OutputPort.prototype.constructor = OutputPort;
OutputPort.prototype.parent = Port.prototype;

OutputPort.prototype.send = function (ip) {
  process.disownIP(ip);

  this.emit("ipSubmitted", {
    portName: this.name,
    ip: ip
  });
  return Fiber.yield();

};

module.exports = OutputPort;
