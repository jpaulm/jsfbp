var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();

var reader = network.defineProcess('./components/reader', 'Read');
var copier = network.defineProcess('./components/copier', 'Copy');
var writer = network.defineProcess('./components/writer', 'Write');

network.initialize(reader, 'FILE', path.resolve(__dirname, 'data/text.txt'));
network.connect(reader, 'OUT', copier, 'IN', 1);
network.initialize(writer, 'FILE', path.resolve(__dirname, 'data/text_new.txt'));
network.connect(copier, 'OUT', writer, 'IN', 1);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
