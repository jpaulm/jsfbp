'use strict';

var IP = require('./IP')
  , Fiber = require('fibers')
  , Utils = require('./utils');

var InputPort = module.exports = function(queue){
  this.name = null;
  this.conn = null;
  this.closed = false;
	this.queue = queue;
};

InputPort.openInputPort = function(name) {
  var proc = Fiber.current.fbpProc;
  var namex = proc.name + '.' + name;  
  //console.log(proc.inports);
  for (var i = 0; i < proc.inports.length; i++) {    
    if (proc.inports[i][0] == namex)
    return proc.inports[i][1];  // return inputport
  } 
  console.log('Port ' + proc.name + '.' + name + ' not found');
  return null;
};

InputPort.prototype.receive = function(){
  var proc = Fiber.current.fbpProc; 
  var conn = this.conn;
    
  if (conn.constructor == Utils.InitConn)  {
   if (tracing)
    console.log(proc.name + ' recv IIP from port ' + this.name + ': ' + conn.contents);
   //var ip = new exports.IP(conn + '');
   var ip = IP.create(conn.contents);
   conn.closed = true;
   ip.user = proc;
   //console.log(conn);
   return ip;
   }
   
  if (tracing)
   console.log(proc.name + ' recv from ' + this.name);
   
  while (true) {    
   if (conn.usedslots == 0){
    if (conn.closed)  {
   if (tracing)
    console.log(proc.name + ' recv EOS from ' + this.name );
   return null; 
   } 
    proc.status = 'R';
    proc.yielded = true; 
    Fiber.yield();
    proc.status = 'A';   
    proc.yielded = false;    
   }
   else
    break;
  }
  //if (conn.usedslots == conn.array.length) 
   for (var i = 0; i < conn.up.length; i ++) { 
    if (conn.up[i].status == 'S'){
    conn.up[i].status = 'K'; 
    this.queue.push(conn.up[i]); 
    }  
   }
      
  var ip = conn.array[conn.nxtget];
  conn.array[conn.nxtget] = null;
  conn.nxtget ++;
  if (conn.nxtget > conn.array.length - 1)
   conn.nxtget = 0;   
  if (tracing)
   console.log(proc.name + ' recv OK: ' + ip.contents); 
  conn.usedslots--;
  ip.owner = proc; 
  proc.ownedIPs++; 
  return ip; 
};

InputPort.prototype.close = function(){
  var proc = Fiber.current.fbpProc; 
  var conn = this.conn;
  conn.closed = true;
  console.log(proc.name + ': ' + conn.usedslots + ' IPs dropped because of close on ' + conn.name);
  for (var i = 0; i < conn.up.length; i ++) { 
    if (conn.up[i].status == 'S')
    this.queue.push(conn.up[i]); 
   }
};