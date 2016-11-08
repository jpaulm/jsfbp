var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defProc('./examples/components/gendata.js', 'Gen');
var copier = network.defProc('./components/copier.js', 'Copy');
var disc = network.defProc('./components/discard.js', 'Disc');
// var recvr = fbp.defProc(require('../components/recvr.js'), 'recvr'); // equivalent

network.initialize(gendata, 'COUNT', '100000000');
network.connect(gendata, 'OUT', copier, 'IN', 5);
network.connect(copier, 'OUT', disc, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
