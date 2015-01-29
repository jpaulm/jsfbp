var fbp = require('./fbp.js');
  
// --- define network ---
var sender = fbp.defProc('./sender.js', 'sender');
var copier_closing = fbp.defProc('./copier_closing.js', 'copier_closing');
var recvr = fbp.defProc('./recvr.js', 'recvr');


fbp.initialize(sender, 'COUNT', '200');
fbp.connect(sender, 'OUT', copier_closing, 'IN', 5);
fbp.connect(copier_closing, 'OUT', recvr, 'IN', 1);

var trace = false;
// --- run ---  
fbp.run(trace);

