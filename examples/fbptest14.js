var fbp = require('..');

// --- define network ---
//var mms0     = fbp.defProc('./components/mockmocksender', 'mms0');
//var delay0      = fbp.defProc('./components/delay', 'delay0');
var mms1     = fbp.defProc('./components/mockmocksender', 'mms1');
var delay1      = fbp.defProc('./components/delay', 'delay1');
var recvr      = fbp.defProc('./components/recvr');

//fbp.initialize(delay0, 'INTVL', '100');   // 100 msecs
fbp.initialize(delay1, 'INTVL', '250');   // 250 msecs
//fbp.initialize(mms0, 'PARMS', '100,(a),4');
//fbp.connect(mms0, 'OUT', delay0, 'IN', 5);
fbp.initialize(mms1, 'PARMS', '250,(b),4');
fbp.connect(mms1, 'OUT', delay1, 'IN', 5);
//fbp.connect(delay0, 'OUT', recvr, 'IN', 5);
fbp.connect(delay1, 'OUT', recvr, 'IN', 5);
               // --- run ---
fbp.run({ trace: true });
//fbp.run();