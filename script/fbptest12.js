
var fbp = require('./fbp.js');
  
// --- define network ---

var reader = fbp.defProc('./reader.js', 'reader');
var copier = fbp.defProc('./copier.js', 'copier');
var writer = fbp.defProc('./writer.js', 'writer');  

fbp.initialize(reader, 'FILE', './data/text.txt');
fbp.connect(reader, 'OUT', copier, 'IN', 1);
fbp.initialize(writer, 'FILE', './data/text_new.txt');
fbp.connect(copier, 'OUT', writer, 'IN', 1);

var trace = true;
// --- run ---  
fbp.run(trace);

