'use strict';

var Fiber = require('fibers');

var IP = module.exports = function IP(contents) {
  this.NORMAL = 0;
  this.OPEN = 1;
  this.CLOSE = 2;
  this.owner = null;
  this.type = this.NORMAL;  
  this.contents = contents;     
}

IP.create = function(x) {
  var ip = new IP(x);
  var proc = Fiber.current.fbpProc;
  if (tracing)
    console.log(proc.name + ' Create IP with: ' + x);
  proc.ownedIPs++;
  ip.owner = proc;
  //ip.type = IP.NORMAL;
  //console.log(ip);
  return ip;
}
  
IP.createBracket = function(bktType, x) {
  if (x == undefined)
    x = null; 
  var ip = new IP(x);    
  ip.type = bktType;     
  var proc = Fiber.current.fbpProc;
  if (tracing)
    console.log(proc.name + ' Create bracket with ' + bktType + ', ' + x);
  proc.ownedIPs++;
  ip.owner = proc;   
  return ip;
} 
  
IP.drop = function(ip) {
  var proc = Fiber.current.fbpProc; 
  if (tracing)
    console.log(proc.name + ' IP dropped with: ' + ip.contents);
  if (ip.owner != proc) {
    console.log(proc.name + ' IP being dropped not owned by this Process: ' + ip.contents); 
    return;
  }  
  proc.ownedIPs--;
  ip.owner = null;
}