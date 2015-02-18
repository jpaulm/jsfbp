'use strict';

var Enum = require('./utils').Enum;

var Process = module.exports = function(name, func) {
  this.name = name;
  this.func = func;
  this.fiber = null;
  this.inports = [];
  this.outports = [];
  this.status = Process.Status.NOT_INITIALIZED;  
  this.ownedIPs = 0; 
  this.cbpending = false;
  this.yielded = false; 
  this.result = null; // [data, err]
};

Process.Status = Enum([
  'NOT_INITIALIZED',
  'ACTIVE', // (includes waiting on callback ...)
  'WAITING_TO_RECEIVE',
  'WAITING_TO_SEND',
  'READY_TO_EXECUTE',
  'DORMANT',
  'CLOSED'
]);

Process.prototype.getStatusString = function () {
  return Process.Status.__lookup(this.status);
};