var Fiber = require('fibers');

// --- classes and functions ---

// http://stackoverflow.com/questions/7694501/class-static-method-in-javascript

IP = function(contents) {
    this.owner = null;
    this.type = 0;  //Normal 
             // 1     Open Bracket
             // 2     Close Bracket
    this.contents = contents;       
}

IP.create = function(x) {
      var ip = new IP(x);
      var proc = currentproc;
      proc.ownedIPs++;
      ip.owner = proc;
      ip.type = 0;
      return ip;
    } 
    
IP.drop = function(ip) {
      var proc = currentproc;
      proc.ownedIPs--;
      ip.owner = null;
    } 
 
exports.IP = IP;   


exports.Process = function (name, func) {
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
    // 'D' dormant
    // 'C' closed  
   this.ownedIPs = 0; 
   this.cbpending = false;
   this.yielded = false;  
}                

exports.Connection = function (size){
  this.name = null; 
  this.array = [];
  this.nxtget = 0;
  this.nxtput = 0; 
  this.up = [];    // list of upstream processes
  this.down = null;  // downstream process
  this.closed = false;
  this.usedslots = 0;
  this.upstreamProcsUnclosed = 0; 
  for (var i = 0; i < size; i++)
    this.array[i] = null;
}

InputPort = function (){
  this.name = null;
  this.conn = null;   
  this.closed = false;  
}

InputPort.openInputPort = function(name) {
   var proc = currentproc;
   var namex = proc.name + '.' + name;   
   //console.log(proc.inports);
   for (var i = 0; i < proc.inports.length; i++) {     
     if (proc.inports[i][0] == namex)
         return proc.inports[i][1];  // return inputport
  } 
  console.log('Port ' + proc.name + '.' + name + ' not found');
  return null;
}

InputPort.prototype.receive = function(){
      var proc = currentproc;
      var conn = this.conn;
                  
      if (conn.constructor == String)  {
        if (tracing)
          console.log(proc.name + ' recv IIP from port ' + this.name + ': ' + conn);
        //var ip = new exports.IP(conn + '');
        var ip = exports.IP.create(conn + '');
        //ip.owner = proc;
       // proc.ownedIPs++;
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
      if (conn.usedslots == conn.array.length) 
        for (var i = 0; i < conn.up.length; i ++) { 
          if (conn.up[i].status == 'S')
             queue.push(conn.up[i]); 
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
}

exports.InputPort = InputPort;

InputPortArray = function (){    
}

InputPortArray.openInputPortArray = function(name) {
   var proc = currentproc;
   var namey = proc.name + '.' + name;
   var hi_index = -1;  
   var array = new Array();
   
   var re = new RegExp(namey + '\\[(\\d+)\\]');  
   
   for (var i = 0; i < proc.inports.length; i++) {   
     var namex = re.exec(proc.inports[i][0]);   
     
     if (namex != null && namex.index == 0) {
        hi_index = Math.max(hi_index, namex[1]);
        array[namex[1]] = proc.inports[i][1];
     }     
   }
   if (hi_index == -1){
   console.log('Port ' + proc.name + '.' + name + ' not found');
     return null; 
   }
  
   return array; 
}


OutputPort = function (){
  this.name = null;
  this.conn = null;   
  this.closed = false;  
}

OutputPort.openOutputPort = function(name) {
   var proc = currentproc;
   var namex = proc.name + '.' + name;
   for (var i = 0; i < proc.outports.length; i++) {
     //console.log(proc.inports[i]);
     if (proc.outports[i][0] == namex)
         return proc.outports[i][1];  // return conn
  } 
  console.log('Port ' + proc.name + '.' + name + ' not found');
  return null;
}

OutputPort.prototype.send = function(ip){
      var proc = currentproc;
      var conn = this.conn;         
          
      if (tracing)
        console.log(proc.name + ' send to ' + this.name + ': ' + ip.contents);
      if (ip.owner != proc) {
        console.log('IP not owned by this Process: ' + ip.contents); 
        return;
        }  
      while (true) {         
        if (conn.usedslots == 0) {
          if (conn.down.status == 'R' || conn.down.status == 'N' || conn.down.status == 'A')
            queue.push(conn.down);
        }  
          //queue[conn.down.name] = queue.conn;
        if (conn.usedslots == conn.array.length)  { 
          proc.status = 'S';
          proc.yielded = true;
          Fiber.yield(0); 
          proc.status = 'A'; 
          proc.yielded = false;         
          }
        else   
          break; 
      }        
      conn.array[conn.nxtput] = ip; 
      conn.nxtput ++;
      if (conn.nxtput > conn.array.length - 1)
        conn.nxtput = 0;
      conn.usedslots++;
      proc.ownedIPs--;
      if (tracing)
        console.log(proc.name + ' send OK');  
       
}

exports.OutputPort = OutputPort;


OutputPortArray = function (){    
}

OutputPortArray.openOutputPortArray = function(name) {
   var proc = currentproc;
   var namey = proc.name + '.' + name;
   var hi_index = -1;  
   var array = new Array();
   
   var re = new RegExp(namey + '\\[(\\d+)\\]');  
   
   for (var i = 0; i < proc.outports.length; i++) {   
     var namex = re.exec(proc.outports[i][0]);   
     
     if (namex != null && namex.index == 0) {
        hi_index = Math.max(hi_index, namex[1]);
        array[namex[1]] = proc.outports[i][1];
     }     
   }
   if (hi_index == -1){
   console.log('Port ' + proc.name + '.' + name + ' not found');
     return null; 
   }
   
   return array; 
}

var list = [];   // list of processes
var queue = [];  // list of processes ready to continue

var tracing = false;
var currentproc;
var count; 

function close(proc){
   //var proc = currentproc;
   if (tracing)
      console.log(proc.name + ' closing');
   //proc.closed = true;
   proc.status = 'C';
   //console.log('cl' + count);
   count--;
   for (var i = 0; i < proc.outports.length; i++) {
      
      var conn = proc.outports[i][1].conn;
      if (conn.usedslots == 0 && ( 
          conn.down.status == 'R' || conn.down.status == 'N' || conn.down.status == 'A'))
            queue.push(conn.down); 
    
      conn.upstreamProcsUnclosed--; 
      
      if (conn.upstreamProcsUnclosed <= 0)
        conn.closed = true;
   }   
       
   for (var i = 0; i < proc.inports.length; i++) {
      var conn = proc.inports[i][1].conn;
      if (conn.constructor == String)
         continue;
      for (var j = 0; j < conn.up.length; j++) { 
          if (conn.up[j].status == 'S')
             queue.push(conn.up[j]); 
      }
   }
   if (proc.ownedIPs != 0)
      console.log(proc.name + ' closed without disposing of all IPs');
   if (tracing)
      console.log(proc.name + ' closed');
}

exports.getCurrentProc = function()  {
   //console.log('get ' + currentproc);
   return currentproc;
}

exports.queueProcCallback = function(proc, func) {
   //console.log('set ' + proc);
   currentproc = proc;
   proc.fiber = new Fiber(func);
   queue.push(proc);
}

exports.setCallbackPending = function(b) {
   currentproc.cbpending = b;
}

 
exports.initialize = function(proc, port, string) {
   var inport = new exports.InputPort();  
   inport.name = proc.name + "." + port; 
   inport.conn = string;
   proc.inports[proc.inports.length] = [proc.name + '.' + port, inport];
}

exports.connect = function(upproc, upport, downproc, downport, capacity) {
   
   var outport = null;
   for (var i = 0; i < upproc.outports.length; i++) {
      outport = upproc.outports[i][1];
      if (outport.name == upproc.name + "." + upport) {
         console.log('Cannot connect one output port (' + outport.name + ') to multiple input ports');
         return;
      }
   }
   
   outport = new exports.OutputPort();  
   outport.name = upproc.name + "." + upport; 
     
   var inportf = null;
   var inport = null;
   for (var i = 0; i < downproc.inports.length; i++) {
      inport = downproc.inports[i][1];
      if (inport.name == downproc.name + "." + downport) {
         inportf = inport;
         break;
      }
   }
   if (inportf == null) {
     inport = new exports.InputPort();  
     inport.name = downproc.name + "." + downport; 
     
     var cnxt = new exports.Connection(capacity);  
     cnxt.name = downproc.name + "." + downport; 
     inport.conn = cnxt;
     
   }
   else { 
     inport = inportf;
     cnxt = inport.conn;
     }
   
   outport.conn = cnxt;    
      
   upproc.outports[upproc.outports.length] = [upproc.name + '.' + upport, outport];   
   downproc.inports[downproc.inports.length] = [downproc.name + '.' + downport, inport]; 
   cnxt.up[cnxt.up.length] = upproc;   
   cnxt.down = downproc;
   cnxt.upstreamProcsUnclosed++;
   //console.log(cnxt);
}

function run(trace) {
Fiber(function() {
  run2(trace);
}).run();
}

exports.run = run;

function run2(trace) { 


var d = new Date();
var st = d.getTime(); 
console.log('Start time: ' + d.toISOString());

tracing = trace;

count = list.length;
//console.log(list);
for (var i = 0; i < list.length; i++) {  
   
   var selfstarting = true;      
   for (var j = 0; j < list[i].inports.length; j++) {  
      var k = list[i].inports[j];   
      if (k[1].conn.constructor != String)
         selfstarting = false;
   } 
   
   if (selfstarting)  
      queue.push(list[i]);
}

while (true) {
  
  var x = queue.shift();
  while (x != undefined){  
    currentproc = x;   
    if (x.status == 'N') {
      x.fiber = new Fiber(x.func);
      x.status = 'A';
    } 
      
    if (x.status != 'C') {     
      
      x.fiber.run();   
      if (!x.yielded && !x.cbpending) 
         close(x);          
    }
    x = queue.shift();
  } 
  
  if (count <= 0)
    break;
  var deadlock = true;  
  for (var i = 0; i < list.length; i++) {
    if (list[i].cbpending) {
      deadlock = false; 
      break;      
      }
  }  
  if (deadlock) {
     console.log('Deadlock detected');
     for (var i = 0; i < list.length; i++) {
       console.log('- Process status: ' + list[i].status + ' - ' + list[i].name);  
     }
     return;
  }
  sleep(100);   // 100 ms
} 


d = new Date();
var et = d.getTime();  
et -= st;
et /= 1000;
console.log('Elapsed time in secs: ' + et.toFixed(3)); 
}  

function sleep(ms) {
  var fiber = Fiber.current;
   //console.log('sleep');
  setTimeout(function() {
      fiber.run();
  }, ms);
  Fiber.yield();
}
