var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defProc('./examples/components/gendata.js');
var copier = network.defProc('./components/copier.js');
var recvr  = network.defProc('./components/recvr.js');
// var recvr = fbp.defProc(require('../components/recvr.js'), 'recvr'); // equivalent

network.initialize(gendata, 'COUNT', '2000');
network.connect(gendata, 'OUT', copier, 'IN', 5);
network.connect(copier, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: false });