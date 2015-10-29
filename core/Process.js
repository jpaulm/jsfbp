'use strict';

var Enum = require('./utils').Enum
  , IP = require('./IP');

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
  'WAITING_TO_FIPE',
  'WAITING_TO_SEND',
  'READY_TO_EXECUTE',
  'DORMANT',
  'CLOSED',
  'DONE'
]);

Process.prototype.getStatusString = function () {
  return Process.Status.__lookup(this.status);
};

Process.prototype.createIP = function (data) {
  var ip = new IP(data);
  this.ownedIPs++;
  ip.owner = this;
  if (tracing) {
	     console.log("Normal IP created: " + ip.contents);
	  }
  return ip;
};

Process.prototype.createIPBracket = function(bktType, x) {
  if (x == undefined) {
    x = null;
  }
  var ip = new IP(x);    
  ip.type = bktType;     
  this.ownedIPs++;
  ip.owner = this;
  if (tracing) {	  
	var cont = ["", "OPEN", "CLOSE"][ip.type] + ", " + ip.contents;		   
    console.log("Bracket IP created: " + cont);
  }
  return ip;
};

Process.prototype.dropIP = function(ip) {
var cont = ip.contents;
if (ip.type != IP.NORMAL) {
       cont = ["", "OPEN", "CLOSE"][ip.type]  + ", " + cont;
  }     
  if (tracing) {
    console.log(this.name + ' IP dropped with: ' + cont);
  }
  if (ip.owner != this) {
    console.log(this.name + ' IP being dropped not owned by this Process: ' + cont); 
    return;
  }  
  this.ownedIPs--;
  ip.owner = null;
};

Process.prototype.openInputPort = function(name) {
  var namex = this.name + '.' + name;  

  for (var i = 0; i < this.inports.length; i++) {    
    if (this.inports[i][0] == namex)
    return this.inports[i][1];  // return inputport
  } 
  console.log('Port ' + this.name + '.' + name + ' not found');
  return null;
};

Process.prototype.openInputPortArray = function(name) {
  var namey = this.name + '.' + name;
  var hi_index = -1;  
  var array = [];

  var re = new RegExp(namey + '\\[(\\d+)\\]');  

  for (var i = 0; i < this.inports.length; i++) {   
    var namex = re.exec(this.inports[i][0]);   

    if (namex != null && namex.index == 0) {
        hi_index = Math.max(hi_index, namex[1]);
        array[namex[1]] = this.inports[i][1];
    }
  }
  if (hi_index == -1) {
    console.log('Port ' + this.name + '.' + name + ' not found');
    return null; 
  }
  
  return array; 
};

Process.prototype.openOutputPort = function(name) {
  var namex = this.name + '.' + name;
  for (var i = 0; i < this.outports.length; i++) {
    if (this.outports[i][0] == namex) {
      return this.outports[i][1];  // return conn
    }
  }
  console.log('Port ' + this.name + '.' + name + ' not found');
  return null;
};

Process.prototype.openOutputPortArray = function(name) {
  var namey = this.name + '.' + name;
  var hi_index = -1;  
  var array = [];

  var re = new RegExp(namey + '\\[(\\d+)\\]');  

  for (var i = 0; i < this.outports.length; i++) {
    var namex = re.exec(this.outports[i][0]);  

    if (namex != null && namex.index == 0) {
      hi_index = Math.max(hi_index, namex[1]);
      array[namex[1]] = this.outports[i][1];
    }    
  }
  if (hi_index == -1){
    console.log('Port ' + this.name + '.' + name + ' not found');
    return null; 
  }
  
  return array; 
};