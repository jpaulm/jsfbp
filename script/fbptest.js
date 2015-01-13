var Fiber = require('fibers');

function IP(contents) {
    this.contents = contents;    
}

function Process(name, func) {
  this.name = name;
  this.func = new Fiber(func); 
}                

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
      if (nxtget == nxtput && array[nxtget] != null){
        queue.push(recvr);       
        Fiber.yield();  
        }       
      array[nxtput] = ip; 
      nxtput ++;
      if (nxtput > array.length - 1)
        nxtput = 0;
}

function receive(){
      if (nxtget == nxtput && array[nxtget] == null){
         queue.push(sender);        
         Fiber.yield();
      }     
      var ip = array[nxtget];
      array[nxtget] = null;
      nxtget ++;
      if (nxtget > array.length - 1)
        nxtget = 0;    
      return ip; 
}

function close_out() {
  queue.push(recvr); 
  Fiber.yield(); 
}

var d = new Date();
var st = d.getTime(); 
var array = [];
var queue = [];
var array_size = 50;
for (var i = 0; i < array_size; i++)
   array[i] = null;

var nxtget = 0;
var nxtput = 0;
sender.func.run();
console.log('s'); 
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