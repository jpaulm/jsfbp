var Fiber = require('fibers');
var senders = require('./sender.js');
var repls = require('./repl.js');
var recvrs = require('./recvr.js');
var concats = require('./concat.js');
var fbp = require('./fbp.js');


  
// --- define network ---

var replp = new fbp.Process('Repl', repls.repl);
var concatp = new fbp.Process('Concat', concats.concat);  
var recvrp = new fbp.Process('Recvr', recvrs.receiver);  
var senderp = new fbp.Process('Sender', senders.sender);  

fbp.initialize(senderp, 'COUNT', '20');
fbp.connect(senderp, 'OUT', replp, 'IN', 5);
fbp.connect(replp, 'OUT[0]', concatp, 'IN[0]', 5);
fbp.connect(replp, 'OUT[1]', concatp, 'IN[1]', 5);
fbp.connect(replp, 'OUT[2]', concatp, 'IN[2]', 5);
fbp.connect(concatp, 'OUT', recvrp, 'IN', 5);

var trace = false;
// --- run ---  
fbp.run(trace);

