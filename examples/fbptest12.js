var fbp = require('..');

// --- define network ---
var reader = fbp.defProc('./components/reader');
var copier = fbp.defProc('./components/copier');
var writer = fbp.defProc('./components/writer');

fbp.initialize(reader, 'FILE', './examples/data/text.txt');
fbp.connect(reader, 'OUT', copier, 'IN', 1);
fbp.initialize(writer, 'FILE', './examples/data/text_new.txt');
fbp.connect(copier, 'OUT', writer, 'IN', 1);

// --- run ---
fbp.run({ trace: false });
