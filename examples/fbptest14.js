var fbp = require('..');

// --- define network ---
var network = new fbp.Network();
var mms0 = network.defProc('./examples/components/mockmocksender', 'mms0');
var delay0 = network.defProc('./components/delay', 'delay0');
var mms1 = network.defProc('./examples/components/mockmocksender', 'mms1');
var delay1 = network.defProc('./components/delay', 'delay1');
var recvr = network.defProc('./components/recvr', 'Recvr');

network.initialize(delay0, 'INTVL', '100');   // 100 msecs
network.initialize(delay1, 'INTVL', '250');   // 250 msecs
network.initialize(mms0, 'PARMS', '100,(a),4');
network.connect(mms0, 'OUT', delay0, 'IN', 5);
network.initialize(mms1, 'PARMS', '250,(b),4');
network.connect(mms1, 'OUT', delay1, 'IN', 5);
network.connect(delay0, 'OUT', recvr, 'IN', 5);
network.connect(delay1, 'OUT', recvr, 'IN', 5);
// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
