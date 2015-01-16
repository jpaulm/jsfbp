var Fiber = require('fibers');

// --- classes and functions ---

function IP(contents) {
    this.contents = contents;    
}

exports.IP = IP;

exports.Process = function (name, func) {
  this.name = name;  
  this.func = func; 
  this.fiber = null;
  this.inports = {};
  this.outports = {};  
  list[list.length] = this;
  //processes[processes.length] = [this.fiber, this];
  
}                

exports.Connection = function (size){
  this.array = [];
  this.nxtget = 0;
  this.nxtput = 0; 
  this.up = null;
  this.down = null;
  this.closed = false;
  this.usedslots = 0;
  for (var i = 0; i < size; i++)
    this.array[i] = null;
}

var processes = [];
var list = [];
var queue = [];

var tracing = false;

exports.send = function(name, ip){
           
      var proc = getProc();
      var conn = proc.outports[name];
      if (tracing)
        console.log(proc.name + ' send to ' + name);
      while (true) {         
        if (conn.usedslots == 0) 
          queue.push(conn.down);  
        if (conn.usedslots == conn.array.length)              
          Fiber.yield();   
        else   
          break; 
      }        
      conn.array[conn.nxtput] = ip; 
      conn.nxtput ++;
      if (conn.nxtput > conn.array.length - 1)
        conn.nxtput = 0;
        conn.usedslots++;
      if (tracing)
        console.log(proc.name + ' send OK');  
}

exports.receive = function(name){
      var proc = getProc();
      var conn = proc.inports[name];
            
      if (conn.constructor == String)  {
        if (tracing)
          console.log(proc.name + ' recv IIP from ' + name + ': ' + conn);
        var ip = new IP(conn + '');
        return ip;
        }
        
      if (tracing)
        console.log(proc.name + ' recv from ' + name);
      while (true) {             
        if (conn.usedslots == 0){
          if (conn.closed)  {
            if (tracing)
              console.log(proc.name + ' recv EOS from ' + name );
            return null; 
            }             
          Fiber.yield();
        }
        else
          break;
      }
      if (conn.usedslots == conn.array.length) 
        queue.push(conn.up); 
        
      var ip = conn.array[conn.nxtget];
      conn.array[conn.nxtget] = null;
      conn.nxtget ++;
      if (conn.nxtget > conn.array.length - 1)
        conn.nxtget = 0;    
      if (tracing)
        console.log(proc.name + ' recv OK'); 
      conn.usedslots--;
      return ip; 
}

exports.close_out = function(name) {
  var proc = getProc();
  var conn = proc.outports[name];
  if (tracing)
    console.log(proc.name + ' close out ' + name);
  if (conn.usedslots == 0)
    queue.push(conn.down); 
  conn.closed = true;
  Fiber.yield(); 
  if (tracing)
    console.log(proc.name + ' close out OK'); 
}

function getProc() {  
  for (var i = 0; i < processes.length; i++) {
    if (processes[i][0] == Fiber.current) 
      return processes[i][1];   
  } 
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
//console.log(processes.length);
  var ops = null;
  for (var i = 0; i < processes.length; i++) {
    if (processes[i][0] == Fiber.current){
      ops = processes[i][1].outports;
      return ops[name];
      break;
    }
  }  
}


exports.run = function(trace) { 

//console.log('Run');
//console.log(list.length);
var d = new Date();
var st = d.getTime(); 
console.log('Start time: ' + d.toISOString());
//console.log(module.exports);
tracing = trace;

for (var i = 0; i < list.length; i++) {
   list[i].fiber = Fiber(list[i].func);   //console.log(list[i]);
   processes[i] = [list[i].fiber, list[i]];         
      
   var selfstarting = true;   
   for (var i in processes[i].inports) {
      if (inports[i].constructor != String)
         selfstarting = false;
   } 
   if (selfstarting)  
      queue.push(list[i])
}

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
}  
