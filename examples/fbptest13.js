var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defProc('./examples/components/gendata', 'Gen');
var randdelay = network.defProc('./components/randdelay', 'RD');
var recvr = network.defProc('./components/recvr', 'Recvr');

network.initialize(gendata, 'COUNT', '20');
network.initialize(randdelay, 'INTVL', '2000');   // random between 0 and 5000 msecs
network.connect(gendata, 'OUT', randdelay, 'IN', 5);
network.connect(randdelay, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
