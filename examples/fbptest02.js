var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();

var reader = network.defineProcess('./components/reader.js', 'Read');
var copier = network.defineProcess('./components/copier.js', 'Copy');
var recvr = network.defineProcess('./components/recvr.js', 'Recvr');

network.initialize(reader, 'FILE', path.resolve(__dirname, 'data/text.txt'));
network.connect(reader, 'OUT', copier, 'IN', 1);
network.connect(copier, 'OUT', recvr, 'IN', 1);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
