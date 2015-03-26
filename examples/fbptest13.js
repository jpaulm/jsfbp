var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var sender     = network.defProc('./components/sender');
var randdelay  = network.defProc('./components/randdelay');
var recvr      = network.defProc('./components/recvr');

network.initialize(sender, 'COUNT', '20');
network.initialize(randdelay, 'INTVL', '5000');   // random between 0 and 5000 msecs
network.connect(sender, 'OUT', randdelay, 'IN', 5);
network.connect(randdelay, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: false });