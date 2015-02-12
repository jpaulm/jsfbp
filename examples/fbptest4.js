var fbp = require('..');

// --- define network ---
var sender = fbp.defProc('./components/sender.js');
var repl   = fbp.defProc('./components/repl.js');
var recvr  = fbp.defProc('./components/recvr.js');

fbp.initialize(sender, 'COUNT', '20');
fbp.connect(sender, 'OUT', repl, 'IN', 5);
fbp.connect(repl, 'OUT[0]', recvr, 'IN', 5);
fbp.connect(repl, 'OUT[1]', recvr, 'IN', 5);
fbp.connect(repl, 'OUT[2]', recvr, 'IN', 5);

// --- run ---
fbp.run({ trace: false });
