
var readers = require('./reader.js');
var copiers = require('./copier.js');
var recvrs = require('./recvr.js');
var fbp = require('./fbp.js');


  
// --- define network ---

var readerp2 = new fbp.Process('Reader2', readers.reader);
var readerp = new fbp.Process('Reader', readers.reader);
var copierp = new fbp.Process('Copier', copiers.copier);  
var recvrp = new fbp.Process('Recvr', recvrs.receiver);  

fbp.initialize(readerp, 'FILE', './text.txt');
fbp.connect(readerp, 'OUT', copierp, 'IN', 5);
fbp.initialize(readerp2, 'FILE', './zzzs.txt');
fbp.connect(readerp2, 'OUT', copierp, 'IN', 5);
fbp.connect(copierp, 'OUT', recvrp, 'IN', 5);

var trace = false;
// --- run ---  
fbp.run(trace);
