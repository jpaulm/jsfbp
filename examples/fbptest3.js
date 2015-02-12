var fbp = require('..');

// --- define network ---
var sender = fbp.defProc('./components/sender.js');
var reader = fbp.defProc('./components/reader.js');
var copier = fbp.defProc('./components/copier.js');
var recvr  = fbp.defProc('./components/recvr.js');

fbp.initialize(sender, 'COUNT', '20');
fbp.connect(sender, 'OUT', copier, 'IN', 5);
fbp.initialize(reader, 'FILE', './examples/data/text.txt');
fbp.connect(reader, 'OUT', copier, 'IN', 5);
fbp.connect(copier, 'OUT', recvr, 'IN', 5);

// --- run ---
fbp.run({ trace: false });
