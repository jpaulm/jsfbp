var fbp = require('..')
, path = require('path');

// --- define network ---
var network = new fbp.Network();

var reader0     = network.defProc('./components/reader', 'reader0');
var delay0      = network.defProc('./components/delay', 'delay0');
var reader1     = network.defProc('./components/reader', 'reader1');
var delay1      = network.defProc('./components/delay', 'delay1');
var recvr       = network.defProc('./components/recvr');

network.initialize(delay0, 'INTVL', '2000');   // 2000 msecs
network.initialize(delay1, 'INTVL', '1000');   // 1000 msecs
network.initialize(reader0, 'FILE', path.resolve(__dirname, 'data/text.txt'));
network.connect(reader0, 'OUT', delay0, 'IN', 2);
network.initialize(reader1, 'FILE', path.resolve(__dirname, 'data/zzzs.txt'));
network.connect(reader1, 'OUT', delay1, 'IN', 2);
network.connect(delay0, 'OUT', recvr, 'IN', 2);
network.connect(delay1, 'OUT', recvr, 'IN', 2);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: false });