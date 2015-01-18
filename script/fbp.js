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
  this.inports = [];
  this.outports = [];
  list[list.length] = this;
  this.closed = false;
  
}                

exports.Connection = function (size){
  this.array = [];
  this.nxtget = 0;
  this.nxtput = 0; 
  this.up = null;    // upstream process
  this.down = null;  // downstream process
  this.closed = false;
  this.usedslots = 0;
  for (var i = 0; i < size; i++)
    this.array[i] = null;
}


var list = [];
var queue = [];

var tracing = false;
var currentproc;
var count; 

exports.create = function(contents) {
   return new exports.IP(contents); 
}

exports.drop = function(contents) {
   var i = 0; 
}

exports.send = function(name, ip){           
      var proc = getProc();
      var conn = getOutport(name);
      if (tracing)
        console.log(proc.name + ' send to ' + name);
      while (true) {         
        if (conn.usedslots == 0) 
          queue.push(conn.down);  
          //queue[conn.down.name] = queue.conn;
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
      var conn = getInport(name);
                  
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
        //queue[conn.up.name] = queue.conn;
        
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

close_out = function(name) {
  var proc = getProc();
  var conn = getOutport(name);
  if (tracing)
    console.log(proc.name + ' close out ' + name);
  if (conn.usedslots == 0 && !conn.down.closed)
    queue.push(conn.down); 
    //queue[conn.down.name] = queue.conn;
  conn.closed = true;
  if (tracing)
    console.log(proc.name + ' close out OK'); 
  //Fiber.yield();   
}

exports.close = function() {
   var proc = getProc();
   if (tracing)
    console.log(proc.name + ' closing ');
   proc.closed = true;
   //console.log(count);
   count--;
   for (var i = 0; i < proc.outports.length; i++) {
      close_out(proc.outports[i][0]);
   }
}

function getProc() {  
//console.log(currentproc);
  return currentproc;
}

exports.getProc = getProc;

function getInport(name) {
  var proc = getProc();
  //console.log(proc);
  
  for (var i = 0; i < proc.inports.length; i++) {
     //console.log(proc.inports[i]);
     if (proc.inports[i][0] == name)
         return proc.inports[i][1];  // return conn
  } 
  return null;
}

function getOutport(name) {
  var proc = getProc();
  for (var i = 0; i < proc.outports.length; i++) {
     if (proc.outports[i][0] == name)
         return proc.outports[i][1];
  } 
  return null;
}

exports.initialize = function(proc, port, string) {
   proc.inports[proc.inports.length] = [port, string];
}

exports.connect = function(upproc, upport, downproc, downport, capacity) {
   var cnxt = new exports.Connection(capacity);   
   upproc.outports[upproc.outports.length] = [upport, cnxt];   
   downproc.inports[downproc.inports.length] = [downport, cnxt]; 
   cnxt.up = upproc;
   cnxt.down = downproc;
}

function run(trace) {
Fiber(function() {
  run2(trace);
}).run();
}

exports.run = run;

function run2(trace) { 

//console.log('Run');
//console.log(list);
var d = new Date();
var st = d.getTime(); 
console.log('Start time: ' + d.toISOString());
//console.log(module.exports);
tracing = trace;

count = list.length;
//console.log(count);
for (var i = 0; i < list.length; i++) {  
   list[i].fiber = new Fiber(list[i].func);
   var selfstarting = true;      
   for (var j = 0; j < list[i].inports.length; j++) {  
      var k = list[i].inports[j];   
      if (k[1].constructor != String)
         selfstarting = false;
   } 
   //console.log(selfstarting);
   if (selfstarting)  
      queue.push(list[i])
}

while (true) {
  
  var x = queue.shift();
  while (x != undefined){  
    currentproc = x;   
    if (!x.closed)
      x.fiber.run();
    x = queue.shift();
  } 
  
  if (count <= 0)
    break;
  sleep(100);
} 


d = new Date();
var et = d.getTime();  
et -= st;
et /= 1000;
console.log('Elapsed time in secs: ' + et.toFixed(3)); 
}  

function sleep(ms) {
  var fiber = Fiber.current;
  console.log('sleep');
  setTimeout(function() {
      fiber.run();
  }, ms);
  Fiber.yield();
}
