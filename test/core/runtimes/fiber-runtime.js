'use strict';

var fbp = require('../../..');

describe('FiberRuntime', function () {
  it('should be able to run a simple sender-->receiver setup', function () {
    var network = new fbp.Network();

    var result = [];
    var sender = network.defProc(new MockSender.generator([1, 2, 3, 4, 5]), "sender");
    var recvr = network.defProc(new MockReceiver.generator(result), "receiver");

    network.connect(sender, 'OUT', recvr, 'IN', 5);

    network.run(new fbp.FiberRuntime(), {trace: false});
    expect(result).to.deep.equal([1, 2, 3, 4, 5]);
  });
});
