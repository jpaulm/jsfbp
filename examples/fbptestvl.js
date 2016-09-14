var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defineProcess('./examples/components/gendata.js', 'Gen');
var copier = network.defineProcess('./components/copier.js', 'Copy');
var disc = network.defineProcess('./components/discard.js', 'Disc');
// var recvr = fbp.defineProcess(require('../components/recvr.js'), 'recvr'); // equivalent

network.initialize(gendata, 'COUNT', '100000000');
network.connect(gendata, 'OUT', copier, 'IN', 5);
network.connect(copier, 'OUT', disc, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
