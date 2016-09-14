var fbp = require('../..');

// --- define network ---
var network = new fbp.Network();

var receiver = network.defineProcess(require('../../components/wsrecv'));
var simproc = network.defineProcess(require('./wssimproc'));
var send = network.defineProcess(require('./wsbroadcast'));

network.initialize(receiver, 'PORTNO', '9003');
network.connect(receiver, 'WSSOUT', send, 'WSSIN', 6);
network.connect(receiver, 'OUT', simproc, 'IN', 6);
network.connect(simproc, 'OUT', send, 'IN', 6);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: true});
