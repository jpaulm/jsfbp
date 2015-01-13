var Fiber = require('fibers');

function IP(contents) {
    this.contents = contents;    
}

function Process(name, func) {
  this.name = name;
  this.func = new Fiber(func); 
}                

function Connection(size){
  this.array = [];
  this.nxtget = 0;
  this.nxtput = 0; 
  for (var i = 0; i < size; i++)
    this.array[i] = null;
}

var conn = new Connection(50);
 
function Sender() {
    for (var i = 0; i < 20000; i++) {
      var ip = new IP(i + ''); 
      send(ip);
    }
    close_out();    
  }
  
var sender = new Process('Sender', Sender);

function Receiver() {
    while (true) {      
      ip = receive();      
      var i = ip.contents;  
      console.log(i); 
    }
  }
  
var recvr = new Process('Recvr', Receiver);  

function send(ip){
      if (conn.nxtget == conn.nxtput && conn.array[conn.nxtget] != null){
        queue.push(recvr);       
        Fiber.yield();  
        }       
      conn.array[conn.nxtput] = ip; 
      conn.nxtput ++;
      if (conn.nxtput > conn.array.length - 1)
        conn.nxtput = 0;
}

function receive(){
      if (conn.nxtget == conn.nxtput && conn.array[conn.nxtget] == null){
         queue.push(sender);        
         Fiber.yield();
      }     
      var ip = conn.array[conn.nxtget];
      conn.array[conn.nxtget] = null;
      conn.nxtget ++;
      if (conn.nxtget > conn.array.length - 1)
        conn.nxtget = 0;    
      return ip; 
}

function close_out() {
  queue.push(recvr); 
  Fiber.yield(); 
}

var d = new Date();
var st = d.getTime(); 

var queue = [];

sender.func.run();

var x = queue.shift();
while (x != undefined) {    
  x.func.run();
  x = queue.shift();
} 
d = new Date();
var et = d.getTime();  
et -= st;
et /= 1000;
console.log('Elapsed time in secs: ' + et.toFixed(3));   