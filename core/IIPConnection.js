'use strict';
var Fiber = require('fibers'),
  Connection = require('./Connection');

var IIPConnection = function (data) {
  this.parent.constructor.call(this);
  this.contents.enqueue(data);
};

IIPConnection.prototype = Object.create(Connection.prototype);
IIPConnection.prototype.constructor = IIPConnection;
IIPConnection.prototype.parent = Connection.prototype;


IIPConnection.prototype.getData = function (portName) {
  var proc = Fiber.current.fbpProc;
  if (this.closed) {
    proc.trace('tried to read from closed IIPConnection to ' + portName);
    return null;
  }
  proc.trace('recv IIP from port ' + portName + ': ' + this.contents);

  var ip = proc.createIP(this.contents.dequeue());
  this.close();
  ip.owner = proc;
  return ip;
};

IIPConnection.prototype.closeFromDownstream = IIPConnection.prototype.close;

module.exports = IIPConnection;
