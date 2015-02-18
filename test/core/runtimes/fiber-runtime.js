'use strict';

var fbp = require('../../..');

describe('FiberRuntime', function() {
  it('should be able to run a simple sender-->receiver setup', function() {
    var network = new fbp.Network();

    var result = [];
    var sender = network.defProc(new MockSender([1,2,3,4,5]));
    var recvr  = network.defProc(new MockReceiver(result));

    network.connect(sender, 'OUT', recvr, 'IN', 5);

    network.run(new fbp.FiberRuntime(), { trace: false });
    expect(result).to.deep.equal([1,2,3,4,5]);    
  });
});