'use strict';

var fbp = require('../..');

describe('collate', function () {
  it('should collate based on a single field', function () {
    var network = new fbp.Network();

    var result = [];

    var sender0 = network.defProc(MockSender.generator(['1,m1', '2,m2', '3,m3']), "sender0");
    var sender1 = network.defProc(MockSender.generator(['1,d11', '1,d12', '2,d21', '3,d31', '3,d32', '3,d33', '4,d41']), "sender1");
    var collate = network.defProc('./components/collate.js', "collate");
    var receiver = network.defProc(MockReceiver.generator(result), "receiver");

    network.initialize(collate, 'CTLFIELDS', '1');
    network.connect(sender0, 'OUT', collate, 'IN[0]', 5);
    network.connect(sender1, 'OUT', collate, 'IN[1]', 5);
    network.connect(collate, 'OUT', receiver, 'IN');

    var fiberRuntime = new fbp.FiberRuntime();
    network.run(fiberRuntime, {trace: false});

    expect(result).to.deep.equal(['1,m1', '1,d11', '1,d12', '2,m2', '2,d21', '3,m3', '3,d31', '3,d32', '3,d33', '4,d41']);
  });
});
