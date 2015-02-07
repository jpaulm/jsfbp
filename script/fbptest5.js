
var fbp = require('./fbp.js');
  
// --- define network ---

var reader = fbp.defProc('./reader.js', 'reader');
var reader2 = fbp.defProc('./reader.js', 'reader', 2);
var copier = fbp.defProc('./copier.js', 'copier');
var recvr = fbp.defProc('./recvr.js', 'recvr');
var rrmerge = fbp.defProc('./rrmerge.js', 'rrmerge');

fbp.initialize(reader, 'FILE', './data/text.txt');
fbp.connect(reader, 'OUT', copier, 'IN', 2);
fbp.initialize(reader2, 'FILE', './data/zzzs.txt');
fbp.connect(reader2, 'OUT', rrmerge, 'IN[0]', 2);
fbp.connect(copier, 'OUT', rrmerge, 'IN[1]', 2);
fbp.connect(rrmerge, 'OUT', recvr, 'IN', 2);

var trace = false;
// --- run ---  
fbp.run(trace);
