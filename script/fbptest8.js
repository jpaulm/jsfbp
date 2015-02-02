var fbp = require('./fbp.js');
  
// --- define network ---
var reader = fbp.defProc('./reader.js', 'reader');
var reverse = fbp.defProc('./reverse.js', 'reverse');
var reverse2 = fbp.defProc('./reverse.js', 'reverse', 2);
var recvr = fbp.defProc('./recvr.js', 'recvr');


fbp.initialize(reader, 'FILE', './data/text.txt');
fbp.connect(reader, 'OUT', reverse, 'IN', 5);
fbp.connect(reverse, 'OUT', reverse2, 'IN', 5);
fbp.connect(reverse2, 'OUT', recvr, 'IN', 1);

var trace = true;
// --- run ---  
fbp.run(trace);

