var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();


var reader = network.defProc('./components/reader.js', "Read");
var reader2 = network.defProc('./components/reader.js', 'Read2');
var copier = network.defProc('./components/copier.js', 'Copy');
var recvr = network.defProc('./components/recvr.js', 'Recvr');
var rrmerge = network.defProc('./components/rrmerge.js', 'RRMerge');

network.initialize(reader, 'FILE', path.resolve(__dirname, 'data/text.txt'));
network.connect(reader, 'OUT', copier, 'IN', 2);
network.initialize(reader2, 'FILE', path.resolve(__dirname, 'data/zzzs.txt'));
network.connect(reader2, 'OUT', rrmerge, 'IN[0]', 2);
network.connect(copier, 'OUT', rrmerge, 'IN[1]', 2);
network.connect(rrmerge, 'OUT', recvr, 'IN', 2);

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
