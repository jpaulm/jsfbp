var fbp = require('../..');

// --- define network ---
var respond  = fbp.defProc(require('../../components/wsresp'));
var simproc  = fbp.defProc(require('./wssimproc'));
var receiver = fbp.defProc(require('../../components/wsrecv'));

fbp.initialize(receiver, 'PORTNO', '9003');
fbp.connect(receiver, 'OUT', simproc, 'IN', 6);
fbp.connect(simproc, 'OUT', respond, 'IN', 6);

// --- run ---
fbp.run({ trace: true });
