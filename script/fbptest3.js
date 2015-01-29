
var fbp = require('./fbp.js');
  
// --- define network ---

var sender = fbp.defProc('./sender.js', 'sender');
var reader = fbp.defProc('./reader.js', 'reader');
var copier = fbp.defProc('./copier.js', 'copier');
var recvr = fbp.defProc('./recvr.js', 'recvr');;  

fbp.initialize(sender, 'COUNT', '20');
fbp.connect(sender, 'OUT', copier, 'IN', 5);
fbp.initialize(reader, 'FILE', './text.txt');
fbp.connect(reader, 'OUT', copier, 'IN', 5);
fbp.connect(copier, 'OUT', recvr, 'IN', 5);

var trace = false;
// --- run ---  
fbp.run(trace);

