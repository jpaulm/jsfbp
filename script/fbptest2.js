
var fbp = require('./fbp.js');
  
// --- define network ---

var reader = fbp.defProc('./reader.js', 'reader');
var copier = fbp.defProc('./copier.js', 'copier');
var recvr = fbp.defProc('./recvr.js', 'recvr');;   

fbp.initialize(reader, 'FILE', './text.txt');
fbp.connect(reader, 'OUT', copier, 'IN', 1);
fbp.connect(copier, 'OUT', recvr, 'IN', 1);

var trace = true;
// --- run ---  
fbp.run(trace);

