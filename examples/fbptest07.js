var fbp = require('..');

// --- define network ---
var sender = fbp.defProc('./components/sender');
var repl   = fbp.defProc('./components/repl');
var concat = fbp.defProc('./components/concat');
var recvr  = fbp.defProc('./components/recvr');

fbp.initialize(sender, 'COUNT', '20');
fbp.connect(sender, 'OUT', repl, 'IN', 5);
fbp.connect(repl, 'OUT[0]', concat, 'IN[0]', 5);
fbp.connect(repl, 'OUT[1]', concat, 'IN[1]', 5);
fbp.connect(repl, 'OUT[2]', concat, 'IN[2]', 5);
fbp.connect(concat, 'OUT', recvr, 'IN', 5);

// --- run ---
fbp.run({ trace: false });