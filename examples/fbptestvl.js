var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var sender = network.defProc('./components/sender.js');
var copier = network.defProc('./components/copier.js');
var disc  = network.defProc('./components/discard.js');
// var recvr = fbp.defProc(require('../components/recvr.js'), 'recvr'); // equivalent

network.initialize(sender, 'COUNT', '100000000');
network.connect(sender, 'OUT', copier, 'IN', 5);
network.connect(copier, 'OUT', disc, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: false });