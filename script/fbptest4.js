
var fbp = require('./fbp.js');
  
// --- define network ---

var sender = fbp.defProc('./sender.js', 'sender');
var repl = fbp.defProc('./repl.js', 'repl');
var recvr = fbp.defProc('./recvr.js', 'recvr');

fbp.initialize(sender, 'COUNT', '20');
fbp.connect(sender, 'OUT', repl, 'IN', 5);
fbp.connect(repl, 'OUT[0]', recvr, 'IN', 5);
fbp.connect(repl, 'OUT[1]', recvr, 'IN', 5);
fbp.connect(repl, 'OUT[2]', recvr, 'IN', 5);

var trace = false;
// --- run ---  
fbp.run(trace);

