/**
 *  This is the same as update.js, except that its output is also compared with
 *  a file of expected results;  since brackets cannot be held in a file,
 *  the first character of each record in the expected results file is used to
 *  decide whether the IP is an open or close bracket, or a normal data IP
 */

var fbp = require('..')
  , path = require('path');

// --- define network ---
var network = new fbp.Network();

var readerm = network.defProc('./components/reader', 'readerm');
var readerd = network.defProc('./components/reader', 'readerd');
var readerc = network.defProc('./components/reader', 'readerc');
var collate = network.defProc('./components/collate', 'coll');
var compare = network.defProc('./examples/components/compare', 'comp');
var gendatawithbreaks = network.defProc('./examples/components/gendatawithbreaks', 'GDWB');
//var display = network.defProc('./components/display');

network.initialize(readerm, 'FILE', path.resolve(__dirname, 'data/mfile'));
network.connect(readerm, 'OUT', collate, 'IN[0]');
network.initialize(readerd, 'FILE', path.resolve(__dirname, 'data/dfile'));
network.connect(readerd, 'OUT', collate, 'IN[1]');
network.initialize(collate, 'CTLFIELDS', '3, 2, 5');
network.connect(collate, 'OUT', compare, 'IN[0]');
network.initialize(readerc, 'FILE', path.resolve(__dirname, 'data/collate_output'));
network.connect(readerc, 'OUT', gendatawithbreaks, 'IN');
network.connect(gendatawithbreaks, 'OUT', compare, 'IN[1]');

// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, {trace: false});
