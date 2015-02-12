'use strict';

var Process = module.exports = function(name, func, list) {
  this.name = name;  
  this.func = func; 
  this.fiber = null;
  this.inports = [];
  this.outports = [];
  list[list.length] = this;
  //this.closed = false;
  this.status = 
       'N'; // not initiated
    // 'A' active    (includes waiting on callback ...)
    // 'R' waiting to receive
    // 'S' waiting to send
    // 'K' ready to execute 
    // 'D' dormant
    // 'C' closed  
  this.ownedIPs = 0; 
  this.cbpending = false;
  this.yielded = false; 
  this.data = null;
};