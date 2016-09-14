var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defineProcess('./examples/components/gendata', 'Gen');
var repl = network.defineProcess('./components/repl', 'Repl');
var concat = network.defineProcess('./components/concat', 'Concat');
var recvr = network.defineProcess('./components/recvr', 'Recvr');

network.initialize(gendata, 'COUNT', '20');
network.connect(gendata, 'OUT', repl, 'IN', 5);
network.connect(repl, 'OUT[0]', concat, 'IN[0]', 5);
network.connect(repl, 'OUT[1]', concat, 'IN[1]', 5);
network.connect(repl, 'OUT[2]', concat, 'IN[2]', 5);
network.connect(concat, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {
  trace: false
});
