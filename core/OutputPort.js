'use strict';
var Fiber = require('fibers');

var OutputPort = module.exports = function(queue){
  this.name = null;
  this.conn = null;  
  this.closed = false;
	this.queue = queue;
};

OutputPort.openOutputPort = function(name) {
  var proc = Fiber.current.fbpProc; 
  var namex = proc.name + '.' + name;
  for (var i = 0; i < proc.outports.length; i++) {
    if (proc.outports[i][0] == namex) {
      return proc.outports[i][1];  // return conn
    }
  }
  console.log('Port ' + proc.name + '.' + name + ' not found');
  return null;
};

OutputPort.prototype.send = function(ip){
  var proc = Fiber.current.fbpProc; 
  var conn = this.conn;    
    
  if (tracing) {
    console.log(proc.name + ' send to ' + this.name + ': ' + ip.contents);
  }
  if (ip.owner != proc) {
    console.log(proc.name + ' IP being sent not owned by this Process: ' + ip.contents); 
    return;
  }  
  if (conn.closed) {
    console.log(proc.name + ' sending to closed connection: ' + conn.name);
    return -1;
  }
  while (true) {    
    if (conn.down.status == 'R' || conn.down.status == 'N' || conn.down.status == 'D') {
      conn.down.status = 'K'; 
      this.queue.push(conn.down);
    }
    if (conn.usedslots == conn.array.length) { 
      proc.status = 'S';
      proc.yielded = true;
      Fiber.yield(); 
      proc.status = 'A'; 
      proc.yielded = false;    
    }
    else {
      break;
    }
  }
  conn.array[conn.nxtput] = ip; 
  conn.nxtput ++;
  if (conn.nxtput > conn.array.length - 1) {
   conn.nxtput = 0;
  }
  conn.usedslots++;
  proc.ownedIPs--;
  if (tracing) {
    console.log(proc.name + ' send OK');  
  }
  return 0;
};