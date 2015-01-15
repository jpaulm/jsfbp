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
var conn1 = new fbp.Connection(5);
var conn2 = new fbp.Connection(5);
senderp.outports['OUT'] = conn1;
copierp.inports['IN'] = conn1;
conn1.up = senderp;
conn1.down = copierp;
copierp.outports['OUT'] = conn2;
recvrp.inports['IN'] = conn2;
conn2.up = copierp;
conn2.down = recvrp;

// --- run ---  
fbp.run();

