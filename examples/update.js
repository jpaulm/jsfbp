var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();

var readerm = network.defineProcess('./components/reader', 'readerm');
var readerd = network.defineProcess('./components/reader', 'readerd');
var collate = network.defineProcess('./components/collate', 'coll');
var display = network.defineProcess('./components/display', 'disp');

network.initialize(readerm, 'FILE', path.resolve(__dirname, 'data/mfile'));
network.connect(readerm, 'OUT', collate, 'IN[0]');
network.initialize(readerd, 'FILE', path.resolve(__dirname, 'data/dfile'));
network.connect(readerd, 'OUT', collate, 'IN[1]');
network.initialize(collate, 'CTLFIELDS', '3, 2, 5');
network.connect(collate, 'OUT', display, 'IN');

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
