var fbp = require('../..');

// --- define network ---
var respond  = fbp.defProc(require('./wsresp'));
var simproc  = fbp.defProc(require('./wssimproc'));
var receiver = fbp.defProc(require('./wsrecv'));

fbp.initialize(receiver, 'PORTNO', '9003');
fbp.connect(receiver, 'OUT', simproc, 'IN', 6);
fbp.connect(simproc, 'OUT', respond, 'IN', 6);

// --- run ---
fbp.run({ trace: true });
