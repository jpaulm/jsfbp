var fbp = require('..');

// --- define network ---
var sender     = fbp.defProc('./components/sender');
var randdelay = fbp.defProc('./components/randdelay');
var recvr      = fbp.defProc('./components/recvr');

fbp.initialize(sender, 'COUNT', '20');
fbp.initialize(randdelay, 'INTVL', '5000');   // random between 0 and 5000 msecs
fbp.connect(sender, 'OUT', randdelay, 'IN', 5);
fbp.connect(randdelay, 'OUT', recvr, 'IN', 5);

// --- run ---
fbp.run({ trace: false });