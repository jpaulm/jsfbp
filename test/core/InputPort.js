var fbp = require('../..');

describe('InputPort', function () {
  it('can receive from an IIP', function(done) {
    var network = new fbp.Network();

    var result = [];

    var receiver = network.defProc(MockReceiver.generator(result), "RECVR");

    network.initialize(receiver, 'IN', '1');

    var fiberRuntime = new fbp.FiberRuntime();
    network.run(fiberRuntime, {trace: false}, function() {
      expect(result).to.deep.equal(['1']);
      done();
    });
  });
});
