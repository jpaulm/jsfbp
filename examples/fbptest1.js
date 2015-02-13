var fbp = require('..');

// --- define network ---
var sender = fbp.defProc('./components/sender.js');
var copier = fbp.defProc('./components/copier.js');
var recvr  = fbp.defProc('./components/recvr.js');
// var recvr = fbp.defProc(require('../components/recvr.js'), 'recvr'); // equivalent

fbp.initialize(sender, 'COUNT', '2000');
fbp.connect(sender, 'OUT', copier, 'IN', 5);
fbp.connect(copier, 'OUT', recvr, 'IN', 5);

// --- run ---
fbp.run({ trace: true });