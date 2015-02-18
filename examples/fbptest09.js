var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var sender = network.defProc('./components/sender');
var copier = network.defProc('./components/copier_closing');
var recvr  = network.defProc('./components/recvr');

network.initialize(sender, 'COUNT', '200');
network.connect(sender, 'OUT', copier, 'IN', 5);
network.connect(copier, 'OUT', recvr, 'IN', 1);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: true });