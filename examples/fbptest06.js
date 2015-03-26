var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var sender  = network.defProc('./components/sender');
var repl    = network.defProc('./components/repl.js');
var rrmerge = network.defProc('./components/rrmerge');
var recvr   = network.defProc('./components/recvr');

network.initialize(sender, 'COUNT', '20');
network.connect(sender, 'OUT', repl, 'IN', 5);
network.connect(repl, 'OUT[0]', rrmerge, 'IN[0]', 5);
network.connect(repl, 'OUT[1]', rrmerge, 'IN[1]', 5);
network.connect(repl, 'OUT[2]', rrmerge, 'IN[2]', 5);
network.connect(rrmerge, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: true });