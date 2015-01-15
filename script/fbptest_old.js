var Fiber = require('fibers');

// --- classes and functions ---
function IP(contents) {
    this.contents = contents;    
}

function Process(name, func) {
  this.name = name;
  this.fiber = new Fiber(func); 
  this.inports = {};
  this.outports = {};
  processes[processes.length] = [this.fiber, this];
}                

function Connection(size){
  this.array = [];
  this.nxtget = 0;
  this.nxtput = 0; 
  this.sender = null;
  this.recvr = null;
  this.closed = false;
  for (var i = 0; i < size; i++)
    this.array[i] = null;
}

function Sender() {
    for (var i = 0; i < 1000; i++) {
      var ip = new IP(i + ''); 
      send('OUT', ip);
    }
    close_out('OUT');    
  }

function Receiver() {
    while (true) {      
      var ip = receive('IN');     
      if (ip == null)
        break; 
      var i = ip.contents;  
      console.log('R: ' + i); 
    }
  }

function Copier() {
    while (true) {      
      var ip = receive('IN');         
      if (ip == null)
        break;
      var i = ip.contents; 
      send('OUT', ip);
    }
    close_out('OUT');    
  }
  
  
function send(name, ip){
      var conn = getOutport(name);
      if (conn.nxtget == conn.nxtput && conn.array[conn.nxtget] != null){
        queue.push(conn.recvr);       
        Fiber.yield();  
        }       
      conn.array[conn.nxtput] = ip; 
      conn.nxtput ++;
      if (conn.nxtput > conn.array.length - 1)
        conn.nxtput = 0;
}

function receive(name){
      var conn = getInport(name);
      if (conn.nxtget == conn.nxtput && conn.array[conn.nxtget] == null){
        if (conn.closed)  
          return null;
      
         queue.push(conn.sender);        
         Fiber.yield();
      } 
        
      var ip = conn.array[conn.nxtget];
      conn.array[conn.nxtget] = null;
      conn.nxtget ++;
      if (conn.nxtget > conn.array.length - 1)
        conn.nxtget = 0;    
      return ip; 
}

function close_out(name) {
  var conn = getOutport(name);
  queue.push(conn.recvr); 
  conn.closed = true;
  Fiber.yield(); 
}

function getInport(name) {
  var ips = null;
  for (var i = 0; i < processes.length; i++) {
    if (processes[i][0] == Fiber.current){
      ips = processes[i][1].inports;
      return ips[name];
      break;
    }
  } 
}

function getOutport(name) {
  var ops = null;
  for (var i = 0; i < processes.length; i++) {
    if (processes[i][0] == Fiber.current){
      ops = processes[i][1].outports;
      return ops[name];
      break;
    }
  }  
}

// --- define network ---

var processes = [];
var sender = new Process('Sender', Sender);
var copier = new Process('Copier', Copier);  
var recvr = new Process('Recvr', Receiver);  
var conn1 = new Connection(50);
var conn2 = new Connection(50);
sender.outports['OUT'] = conn1;
copier.inports['IN'] = conn1;
conn1.sender = sender;
conn1.recvr = copier;
copier.outports['OUT'] = conn2;
recvr.inports['IN'] = conn2;
conn2.sender = copier;
conn2.recvr = recvr;

// --- run ---  
var d = new Date();
var st = d.getTime(); 

var queue = [];

sender.fiber.run();   //self-starting

var x = queue.shift();
while (x != undefined) {    
  x.fiber.run();
  x = queue.shift();
} 

d = new Date();
var et = d.getTime();  
et -= st;
et /= 1000;
console.log('Elapsed time in secs: ' + et.toFixed(3));   