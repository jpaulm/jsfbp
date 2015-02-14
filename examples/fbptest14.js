var fbp = require('..')
, path = require('path');

// --- define network ---
var reader0     = fbp.defProc('./components/reader', 'reader0');
var delay0      = fbp.defProc('./components/delay', 'delay0');
var reader1     = fbp.defProc('./components/reader', 'reader1');
var delay1      = fbp.defProc('./components/delay', 'delay1');
var recvr      = fbp.defProc('./components/recvr');

fbp.initialize(delay0, 'INTVL', '2000');   // 2000 msecs
fbp.initialize(delay1, 'INTVL', '1000');   // 1000 msecs
fbp.initialize(reader0, 'FILE', path.resolve(__dirname, 'data/text.txt'));
fbp.connect(reader0, 'OUT', delay0, 'IN', 2);
fbp.initialize(reader1, 'FILE', path.resolve(__dirname, 'data/zzzs.txt'));
fbp.connect(reader1, 'OUT', delay1, 'IN', 2);
fbp.connect(delay0, 'OUT', recvr, 'IN', 2);
fbp.connect(delay1, 'OUT', recvr, 'IN', 2);
               // --- run ---
//fbp.run({ trace: true });
fbp.run();