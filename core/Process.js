'use strict';

var Process = module.exports = function(name, func, list) {
  this.name = name;  
  this.func = func; 
  this.fiber = null;
  this.inports = [];
  this.outports = [];
  list[list.length] = this;
  this.status = Process.Status.NOT_INITIALIZED;  
  this.ownedIPs = 0; 
  this.cbpending = false;
  this.yielded = false; 
  this.data = null;
};

Process.Status = {
  NOT_INITIALIZED: 1,
  ACTIVE: 2, // (includes waiting on callback ...)
  WAITING_TO_RECEIVE: 3,
  WAITING_TO_SEND: 4,
  READY_TO_EXECUTE: 5,
  DORMANT: 6,
  CLOSED: 8
};

module.exports.statusString = function(value) {
   var list = ['',
  'NOT_INITIALIZED', 
  'ACTIVE', 
  'WAITING_TO_RECEIVE', 
  'WAITING_TO_SEND', 
  'READY_TO_EXECUTE', 
  'DORMANT', 
  'CLOSED'];
  return list[value];
  };