var fbp = require('..');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defProc('./examples/components/gendata', 'Gen');
var lbal = network.defProc('./components/lbal', 'LBal');
var randdelay0 = network.defProc('./components/randdelay', 'RD0');
var randdelay1 = network.defProc('./components/randdelay', 'RD1');
var randdelay2 = network.defProc('./components/randdelay', 'RD2');
var recvr = network.defProc('./components/recvr', 'Recvr');

network.initialize(gendata, 'COUNT', '20');
network.initialize(randdelay0, 'INTVL', '5000');   // random between 0 and 5000 msecs
network.initialize(randdelay1, 'INTVL', '5000');
network.initialize(randdelay2, 'INTVL', '5000');
network.connect(gendata, 'OUT', lbal, 'IN', 5);
network.connect(lbal, 'OUT[0]', randdelay0, 'IN', 5);
network.connect(lbal, 'OUT[1]', randdelay1, 'IN', 5);
network.connect(lbal, 'OUT[2]', randdelay2, 'IN', 5);

network.connect(randdelay0, 'OUT', recvr, 'IN', 5);
network.connect(randdelay1, 'OUT', recvr, 'IN', 5);
network.connect(randdelay2, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
