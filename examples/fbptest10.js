var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defProc('./examples/components/gendata');
var copier = network.defProc('./examples/components/copier_nonlooper');
var recvr = network.defProc('./components/recvr');

network.initialize(gendata, 'COUNT', '200');
network.connect(gendata, 'OUT', copier, 'IN', 10);
network.connect(copier, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
