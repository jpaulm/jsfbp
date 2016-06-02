var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();

var readerm = network.defProc('./components/reader', 'readerm');
var readerd = network.defProc('./components/reader', 'readerd');
var collate = network.defProc('./components/collate', 'coll');
var display = network.defProc('./components/display', 'disp');

network.initialize(readerm, 'FILE', path.resolve(__dirname, 'data/mfile'));
network.connect(readerm, 'OUT', collate, 'IN[0]');
network.initialize(readerd, 'FILE', path.resolve(__dirname, 'data/dfile'));
network.connect(readerd, 'OUT', collate, 'IN[1]');
network.initialize(collate, 'CTLFIELDS', '3, 2, 5');
network.connect(collate, 'OUT', display, 'IN');

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
