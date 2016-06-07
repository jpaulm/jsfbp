'use strict';
var Fiber = require('fibers');

var IIPConnection = function (data) {
  this.contents = data;
  this.closed = false;
};

IIPConnection.prototype.setRuntime = function (runtime) {
  this._runtime = runtime;
};

IIPConnection.prototype.getData = function (portName) {
  var proc = Fiber.current.fbpProc;
  if(this.closed) {
    proc.trace('tried to read from closed IIPConnection to ' + portName);
    return null;
  }
  proc.trace('recv IIP from port ' + portName + ': ' + this.contents);

  var ip = proc.createIP(this.contents);
  this.close();
  ip.owner = proc;
  return ip;
};

var close = function () {
  this.closed = true;
};

IIPConnection.prototype.close = close;
IIPConnection.prototype.closeFromDownstream = close;

module.exports = IIPConnection;
