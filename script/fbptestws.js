
var fbp = require('./fbp.js');
  
// --- define network ---

var respond = fbp.defProc('./wsresp.js', 'wsresp'); 
var simproc = fbp.defProc('./wssimproc.js', 'wssimproc');
var receiver = fbp.defProc('./wsrecv', 'wsrecv');

fbp.initialize(receiver, 'PORTNO', '9003');
fbp.connect(receiver, 'OUT', simproc, 'IN', 6);
fbp.connect(simproc, 'OUT', respond, 'IN', 6);

var trace = true;
// --- run ---  
fbp.run(trace);

