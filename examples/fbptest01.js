var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

network.defineProcess('./examples/components/gendata.js', 'Gen');
network.defineProcess('./components/copier.js', 'Copy');
network.defineProcess('./components/recvr.js', 'Recvr');

//network.initialize(gendata, 'COUNT', '2000');
//network.connect(gendata, 'OUT', copier, 'IN', 5);
//network.connect(copier, 'OUT', recvr, 'IN', 5);

network.sinitialize('Gen.COUNT', '2000');
network.sconnect('Gen.OUT', 'Copy.IN', 5);
network.sconnect('Copy.OUT', 'Recvr.IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
