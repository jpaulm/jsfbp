var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var sender = network.defProc('./components/sender');
var repl   = network.defProc('./components/repl');
var concat = network.defProc('./components/concat');
var recvr  = network.defProc('./components/recvr');

network.initialize(sender, 'COUNT', '20');
network.connect(sender, 'OUT', repl, 'IN', 5);
network.connect(repl, 'OUT[0]', concat, 'IN[0]', 5);
network.connect(repl, 'OUT[1]', concat, 'IN[1]', 5);
network.connect(repl, 'OUT[2]', concat, 'IN[2]', 5);
network.connect(concat, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: true });