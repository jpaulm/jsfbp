var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();

var reader = network.defProc('./components/reader.js', 'Read');
var copier = network.defProc('./components/copier.js', 'Copy');
var recvr = network.defProc('./components/recvr.js', 'Recvr');

network.initialize(reader, 'FILE', path.resolve(__dirname, 'data/text.txt'));
network.connect(reader, 'OUT', copier, 'IN', 1);
network.connect(copier, 'OUT', recvr, 'IN', 1);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
