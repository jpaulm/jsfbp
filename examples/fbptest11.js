var fbp = require('..');

// --- define network ---
var sender     = fbp.defProc('./components/sender');
var lbal       = fbp.defProc('./components/lbal');
var randdelay0 = fbp.defProc('./components/randdelay', 'randdelay0');
var randdelay1 = fbp.defProc('./components/randdelay', 'randdelay1');
var randdelay2 = fbp.defProc('./components/randdelay', 'randdelay2');
var recvr      = fbp.defProc('./components/recvr');

fbp.initialize(sender, 'COUNT', '20');
fbp.initialize(randdelay0, 'INTVL', '2000');   // random between 0 and 2000 msecs
fbp.initialize(randdelay1, 'INTVL', '2000');
fbp.initialize(randdelay2, 'INTVL', '2000');
fbp.connect(sender, 'OUT', lbal, 'IN', 5);
fbp.connect(lbal, 'OUT[0]',randdelay0, 'IN', 5);
fbp.connect(lbal, 'OUT[1]',randdelay1, 'IN', 5);
fbp.connect(lbal, 'OUT[2]',randdelay2, 'IN', 5);

fbp.connect(randdelay0, 'OUT', recvr, 'IN', 5);
fbp.connect(randdelay1, 'OUT', recvr, 'IN', 5);
fbp.connect(randdelay2, 'OUT', recvr, 'IN', 5);

// --- run ---
fbp.run({ trace: true });