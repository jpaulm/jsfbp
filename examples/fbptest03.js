var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();

var gendata = network.defineProcess('./examples/components/gendata.js', 'Gen');
var reader = network.defineProcess('./components/reader.js', 'Read');
var copier = network.defineProcess('./components/copier.js', 'Copy');
var recvr = network.defineProcess('./components/recvr.js', 'Recvr');

network.initialize(gendata, 'COUNT', '20');
network.connect(gendata, 'OUT', copier, 'IN', 5);
network.initialize(reader, 'FILE', path.resolve(__dirname, 'data/text.txt'));
network.connect(reader, 'OUT', copier, 'IN', 5);
network.connect(copier, 'OUT', recvr, 'IN', 5);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
