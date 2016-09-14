var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defineProcess('./examples/components/gendata', 'Gen');
var copier = network.defineProcess('./examples/components/copier_closing', 'CC');
var recvr = network.defineProcess('./components/recvr', 'Recvr');

network.initialize(gendata, 'COUNT', '200');
network.connect(gendata, 'OUT', copier, 'IN', 5);
network.connect(copier, 'OUT', recvr, 'IN', 1);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
