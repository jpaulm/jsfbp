var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defProc('./examples/components/gendata', 'Gen');
var repl = network.defProc('./components/repl.js', 'Repl');
var rrmerge = network.defProc('./components/rrmerge', 'RRMerge');
var recvr = network.defProc('./components/recvr', 'Recvr');

network.initialize(gendata, 'COUNT', '20');
network.connect(gendata, 'OUT', repl, 'IN', 5);
network.connect(repl, 'OUT[0]', rrmerge, 'IN[0]', 5);
network.connect(repl, 'OUT[1]', rrmerge, 'IN[1]', 5);
network.connect(repl, 'OUT[2]', rrmerge, 'IN[2]', 5);
network.connect(rrmerge, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
