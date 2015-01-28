var Fiber = require('fibers');

var readers = require('./reader.js');
var reverses = require('./reverse.js');
var recvrs = require('./recvr.js');
var fbp = require('./fbp.js');


  
// --- define network ---


var readerp = new fbp.Process('Reader', readers.reader);
var reversep = new fbp.Process('Reverse', reverses.reverse);  
var reversep2 = new fbp.Process('Reverse2', reverses.reverse);
var recvrp = new fbp.Process('Recvr', recvrs.receiver);  

fbp.initialize(readerp, 'FILE', './text.txt');
fbp.connect(readerp, 'OUT', reversep, 'IN', 5);
fbp.connect(reversep, 'OUT', reversep2, 'IN', 5);
fbp.connect(reversep2, 'OUT', recvrp, 'IN', 1);

var trace = true;
// --- run ---  
fbp.run(trace);

