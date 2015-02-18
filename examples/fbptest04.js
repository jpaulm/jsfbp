var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var sender = network.defProc('./components/sender.js');
var repl   = network.defProc('./components/repl.js');
var recvr  = network.defProc('./components/recvr.js');

network.initialize(sender, 'COUNT', '20');
network.connect(sender, 'OUT', repl, 'IN', 5);
network.connect(repl, 'OUT[0]', recvr, 'IN', 5);
network.connect(repl, 'OUT[1]', recvr, 'IN', 5);
network.connect(repl, 'OUT[2]', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: true });