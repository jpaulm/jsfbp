// testsubstreamsensitivesplitting.js

var fbp = require('..');

// this network is to test interaction between lbal (Load balancer) and substreams - 
// the substreams may be rearranged, but within a substreams the IPs must preserve their 
// number and sequence 

// --- define network ---
var network = new fbp.Network();

var genss = network.defProc('./examples/components/genss.js');
var lbal = network.defProc('./components/lbal.js');
var passthru0  = network.defProc('./components/passthru.js');
var passthru1  = network.defProc('./components/passthru.js');
var passthru2  = network.defProc('./components/passthru.js');
var recvr  = network.defProc('./components/recvr.js');

var makeMergeSubstreamSensitive = true;

network.initialize(genss, 'COUNT', '400');
network.connect(genss, 'OUT', lbal, 'IN', 50);
network.connect(lbal, 'OUT[0]', passthru0, 'IN', 50);
network.connect(lbal, 'OUT[1]', passthru1, 'IN', 50);
network.connect(lbal, 'OUT[2]', passthru2, 'IN', 50);

/*
 * 3 passthru's feeding one port -> pretty mixed up data
*/  
if (!makeMergeSubstreamSensitive) {
      network.connect(passthru0, 'OUT', recvr, 'IN');
      network.connect(passthru1, 'OUT', recvr, 'IN');
      network.connect(passthru2, 'OUT', recvr, 'IN');
}
else {
	  var ssmerge  = network.defProc('./components/substreamsensitivemerge.js');
	  
	  network.connect(passthru0, 'OUT', ssmerge, 'IN[0]');
	  network.connect(passthru1, 'OUT', ssmerge, 'IN[1]');
	  network.connect(passthru2, 'OUT', ssmerge, 'IN[2]');	
	  network.connect(ssmerge, 'OUT', recvr, 'IN');
}



// --- run ---
var fiberRuntime = new fbp.FiberRuntime();
network.run(fiberRuntime, { trace: false });