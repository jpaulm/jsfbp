var fbp = require('../..');

// --- define network ---
var network = new fbp.Network();

var respond  = network.defProc(require('./wschatresp'));
var simproc  = network.defProc(require('./wssimproc'));
var receiver = network.defProc(require('./wschatrecv'));

network.initialize(receiver, 'PORTNO', '9003');
network.connect(receiver, 'OUT', simproc, 'IN', 6);
network.connect(simproc, 'OUT', respond, 'IN', 6);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: true });
