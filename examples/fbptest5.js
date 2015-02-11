var fbp = require('..')
  , path = require('path');

// --- define network ---
var reader  = fbp.defProc('./components/reader.js');
var reader2 = fbp.defProc('./components/reader.js', 'reader2');
var copier  = fbp.defProc('./components/copier.js');
var recvr   = fbp.defProc('./components/recvr.js');
var rrmerge = fbp.defProc('./components/rrmerge.js');

fbp.initialize(reader, 'FILE', path.resolve(__dirname, 'data/text.txt'));
fbp.connect(reader, 'OUT', copier, 'IN', 2);
fbp.initialize(reader2, 'FILE', path.resolve(__dirname, 'data/zzzs.txt'));
fbp.connect(reader2, 'OUT', rrmerge, 'IN[0]', 2);
fbp.connect(copier, 'OUT', rrmerge, 'IN[1]', 2);
fbp.connect(rrmerge, 'OUT', recvr, 'IN', 2);

// --- run ---
fbp.run({ trace: false });
