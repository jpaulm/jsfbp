var fbp = require('..');

// --- define network ---
var sender  = fbp.defProc('./components/sender');
var repl    = fbp.defProc('./components/repl.js');
var rrmerge = fbp.defProc('./components/rrmerge');
var recvr   = fbp.defProc('./components/recvr');

fbp.initialize(sender, 'COUNT', '20');
fbp.connect(sender, 'OUT', repl, 'IN', 5);
fbp.connect(repl, 'OUT[0]', rrmerge, 'IN[0]', 5);
fbp.connect(repl, 'OUT[1]', rrmerge, 'IN[1]', 5);
fbp.connect(repl, 'OUT[2]', rrmerge, 'IN[2]', 5);
fbp.connect(rrmerge, 'OUT', recvr, 'IN', 5);

// --- run ---
fbp.run({ trace: false });
