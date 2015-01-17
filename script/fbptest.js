var Fiber = require('fibers');
var senders = require('./sender.js');
var copiers = require('./copier.js');
var recvrs = require('./recvr.js');
var fbp = require('./fbp.js');


  
// --- define network ---

//var processes = [];
var senderp = new fbp.Process('Sender', senders.sender);
var copierp = new fbp.Process('Copier', copiers.copier);  
var recvrp = new fbp.Process('Recvr', recvrs.receiver);  

fbp.initialize(senderp, 'COUNT', '2000');
fbp.connect(senderp, 'OUT', copierp, 'IN', 5);
fbp.connect(copierp, 'OUT', recvrp, 'IN', 5);

var trace = false;
// --- run ---  
fbp.run(trace);

