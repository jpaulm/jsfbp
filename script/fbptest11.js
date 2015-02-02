var fbp = require('./fbp.js');
  
// --- define network ---

var sender = fbp.defProc('./sender.js', 'sender');
var lbal = fbp.defProc('./lbal.js', 'lbal');
var randdelay0 = fbp.defProc('./randdelay.js', 'randdelay', 0);  
var randdelay1 = fbp.defProc('./randdelay.js', 'randdelay', 1);  
var randdelay2 = fbp.defProc('./randdelay.js', 'randdelay', 2);  
var recvr = fbp.defProc('./recvr.js', 'recvr'); 

fbp.initialize(sender, 'COUNT', '20');
fbp.connect(sender, 'OUT', lbal, 'IN', 5);
fbp.connect(lbal, 'OUT[0]',randdelay0, 'IN', 5);
fbp.connect(lbal, 'OUT[1]',randdelay1, 'IN', 5);
fbp.connect(lbal, 'OUT[2]',randdelay2, 'IN', 5);

fbp.connect(randdelay0, 'OUT', recvr, 'IN', 5);
fbp.connect(randdelay1, 'OUT', recvr, 'IN', 5);
fbp.connect(randdelay2, 'OUT', recvr, 'IN', 5);

//var trace = true;
var trace = false;
// --- run ---  
fbp.run(trace);



