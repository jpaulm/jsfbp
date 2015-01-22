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
  //this.closed = false;
  this.status = 
       'N'; // not initiated
    // 'A' active    (includes waiting on callback ...)
    // 'R' waiting to receive
    // 'S' waiting to send
    // 'D' dormant
    // 'C' closed    
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


var list = [];
var queue = [];

var tracing = false;
var currentproc;
var count; 

exports.create = function(contents) {   
   if (tracing) {
      var proc = currentproc;
      console.log(proc.name + ' create IP');
      }
   return new exports.IP(contents); 
}

exports.drop = function(contents) {
   if (tracing) {
      var proc = currentproc;
      console.log(proc.name + ' drop IP'); 
      }
}

exports.send = function(name, ip){           
      var proc = currentproc;
      var conn = getOutport(proc, name);
           
      if (tracing)
        console.log(proc.name + ' send to ' + name);
      while (true) {         
        if (conn.usedslots == 0) {
          if (conn.down.status == 'R' || conn.down.status == 'N' || conn.down.status == 'A')
            queue.push(conn.down);
        }  
          //queue[conn.down.name] = queue.conn;
        if (conn.usedslots == conn.array.length)  { 
          proc.status = 'S';
          Fiber.current = proc.fiber;         
          Fiber.yield(0); 
          proc.status = 'A';          
          }
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
      var proc = currentproc;
      var conn = getInport(proc, name);
                  
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
          proc.status = 'R';
          Fiber.current = proc.fiber;          
          Fiber.yield();
          proc.status = 'A';          
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
        console.log(proc.name + ' recv OK'); 
      conn.usedslots--;
      return ip; 
}



exports.close = function() {
   var proc = currentproc;
   if (tracing)
      console.log(proc.name + ' closing');
   //proc.closed = true;
   proc.status = 'C';
   count--;
   for (var i = 0; i < proc.outports.length; i++) {
      
      var conn = proc.outports[i][1];
      if (conn.usedslots == 0 &&  
          conn.down.status == 'R' || conn.down.status == 'N' || conn.down.status == 'A')
            queue.push(conn.down); 
    
      conn.upstreamProcsUnclosed--; 
      
      if (conn.upstreamProcsUnclosed <= 0)
        conn.closed = true;
   }   
       
   for (var i = 0; i < proc.inports.length; i++) {
      var conn = proc.inports[i][1];
      if (conn.constructor == String)
         continue;
      for (var j = 0; j < conn.up.length; j++) { 
          if (conn.up[j].status == 'S')
             queue.push(conn.up[j]); 
      }
   }
   if (tracing)
      console.log(proc.name + ' closed');
}

exports.getCurrentProc = function()  {
   //console.log('get ' + currentproc);
   return currentproc;
}

exports.setCurrentProc = function(proc) {
   //console.log('set ' + proc);
   currentproc = proc;
}

exports.inArrayLength = function(name) {   // name up to and excluding left square bracket
   var hi_index = 0;
   var proc = currentproc;
   var re = new RegExp(name + '\\[(\\d+)\\]');
   for (var i = 0; i < proc.inports.length; i++) {   
     var array = re.exec(proc.inports[i][0]); 
     if (array  != null && array.index == 0) {
        hi_index = Math.max(hi_index, array[1]);
     }
     
  } 
   return hi_index + 1;
}
 
 exports.outArrayLength = function(name) {   // name up to and excluding left square bracket
   var hi_index = 0;
   var proc = currentproc;
   var re = new RegExp(name + '\\[(\\d+)\\]');
   console.log(proc.outports);
   for (var i = 0; i < proc.outports.length; i++) {   
     var array = re.exec(proc.outports[i][0]); 
     console.log(array);
     if (array  != null && array.index == 0) {
        hi_index = Math.max(hi_index, array[1]);
     }
     
  } 
   return hi_index + 1;
}
function getInport(proc, name) {
  //var proc = currentproc;;
  //console.log(proc);
  
  for (var i = 0; i < proc.inports.length; i++) {
     //console.log(proc.inports[i]);
     if (proc.inports[i][0] == name)
         return proc.inports[i][1];  // return conn
  } 
  return null;
}

function getOutport(proc, name) {
  //var proc = currentproc;
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
   var cnxtf = null;
   var cnxt = null;
   for (var i = 0; i < upproc.outports.length; i++) {
      cnxt = upproc.outports[i][1];
      if (cnxt.name == upproc.name + "." + upport) {
         console.log('Cannot connect one output port to multiple input ports');
         return;
      }
   }
   for (var i = 0; i < downproc.inports.length; i++) {
      cnxt = downproc.inports[i][1];
      if (cnxt.name == downproc.name + "." + downport) {
         cnxtf = cnxt;
         break;
      }
   }
   if (cnxtf == null) {
     cnxt = new exports.Connection(capacity);  
     cnxt.name=downproc.name + "." + downport; 
   }
   else {
     cnxt = cnxtf;
     //console.log('Connection found');
     }
   upproc.outports[upproc.outports.length] = [upport, cnxt];   
   downproc.inports[downproc.inports.length] = [downport, cnxt]; 
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
    //console.log(x.name);  
    if (x.status != 'C') {     
      //console.log('Run ' + x.name);    
      x.fiber.run();             
    }
    x = queue.shift();
  } 
  
  if (count <= 0)
    break;
  sleep(50);
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
