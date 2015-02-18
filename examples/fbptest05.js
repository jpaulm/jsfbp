var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();

var reader  = network.defProc('./components/reader.js');
var reader2 = network.defProc('./components/reader.js', 'reader2');
var copier  = network.defProc('./components/copier.js');
var recvr   = network.defProc('./components/recvr.js');
var rrmerge = network.defProc('./components/rrmerge.js');

network.initialize(reader, 'FILE', path.resolve(__dirname, 'data/text.txt'));
network.connect(reader, 'OUT', copier, 'IN', 2);
network.initialize(reader2, 'FILE', path.resolve(__dirname, 'data/zzzs.txt'));
network.connect(reader2, 'OUT', rrmerge, 'IN[0]', 2);
network.connect(copier, 'OUT', rrmerge, 'IN[1]', 2);
network.connect(rrmerge, 'OUT', recvr, 'IN', 2);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: true });