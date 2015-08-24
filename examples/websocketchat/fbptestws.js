var fbp = require('../..');

// --- define network ---
var network = new fbp.Network();

var receiver = network.defProc(require('./wschatrecv'));
var simproc  = network.defProc(require('./wssimproc'));
var send = network.defProc(require('./wschatsend'));

network.initialize(receiver, 'PORTNO', '9003');
network.connect(receiver, 'OUT', simproc, 'IN', 6);
network.connect(simproc, 'OUT', send, 'IN', 6);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: true });
