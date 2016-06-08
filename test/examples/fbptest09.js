var fbp = require('../..');

/*
 * I added this because the example was failing following some changes I made.
 * Seemed to me that that made it a good test case!
 */

describe('fbptest09', function() {
  it('does not fail', function(done) {

// --- define network ---
    var network = new fbp.Network();

    var gendata = network.defProc('./examples/components/gendata', 'Gen');
    var copier = network.defProc('./examples/components/copier_closing', 'CC');
    var recvr = network.defProc('./components/recvr', 'Recvr');

    network.initialize(gendata, 'COUNT', '200');
    network.connect(gendata, 'OUT', copier, 'IN', 5);
    network.connect(copier, 'OUT', recvr, 'IN', 1);

// --- run ---
    var fiberRuntime = new fbp.FiberRuntime();
    expect(function() {
      network.run(fiberRuntime, {trace: false}, done);
    }).not.to.throw();

  });

});
