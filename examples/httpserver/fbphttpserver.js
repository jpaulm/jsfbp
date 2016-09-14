var fbp = require('../..');

// --- define network ---
var network = new fbp.Network();

var receiver = network.defineProcess(require('../../components/httpserver'));
var myproc = network.defineProcess(require('./myproc'));
var send = network.defineProcess(require('./myresponse'));

network.initialize(receiver, 'PORTNO', '8080');
network.connect(receiver, 'OUT', myproc, 'IN', 6);
network.connect(myproc, 'OUT', send, 'IN', 6);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: true});
