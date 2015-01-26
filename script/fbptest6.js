var Fiber = require('fibers');
var senders = require('./sender.js');
var repls = require('./repl.js');
var recvrs = require('./recvr.js');
var rrmerges = require('./rrmerge.js');
var fbp = require('./fbp.js');


  
// --- define network ---

var replp = new fbp.Process('Repl', repls.repl);
var rrmergep = new fbp.Process('RRMerge', rrmerges.rrmerge);  
var recvrp = new fbp.Process('Recvr', recvrs.receiver);  
var senderp = new fbp.Process('Sender', senders.sender);  

fbp.initialize(senderp, 'COUNT', '20');
fbp.connect(senderp, 'OUT', replp, 'IN', 5);
fbp.connect(replp, 'OUT[0]', rrmergep, 'IN[0]', 5);
fbp.connect(replp, 'OUT[1]', rrmergep, 'IN[1]', 5);
fbp.connect(replp, 'OUT[2]', rrmergep, 'IN[2]', 5);
fbp.connect(rrmergep, 'OUT', recvrp, 'IN', 5);

var trace = false;
// --- run ---  
fbp.run(trace);

