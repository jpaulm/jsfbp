var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defProc('./examples/components/gendata.js', 'Gen');
var repl = network.defProc('./components/repl.js', 'Repl');
var recvr = network.defProc('./components/recvr.js', 'Recvr');

network.initialize(gendata, 'COUNT', '20');
network.connect(gendata, 'OUT', repl, 'IN', 5);
network.connect(repl, 'OUT[0]', recvr, 'IN', 5);
network.connect(repl, 'OUT[1]', recvr, 'IN', 5);
network.connect(repl, 'OUT[2]', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
