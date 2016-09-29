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

IIPConnection.prototype.getData = function () {
  var proc = Fiber.current.fbpProc;
  if (this.closed) {
    return null;
  }

  var ip = proc.createIP(this.contents.dequeue());
  this.close();
  ip.owner = proc;
  return ip;
};

IIPConnection.prototype.closeFromDownstream = IIPConnection.prototype.close;

module.exports = IIPConnection;
