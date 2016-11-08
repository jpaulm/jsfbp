'use strict';

var fbp = require('../..');

describe('copier', function () {
  it('should copy multiple IPs', function (done) {
    var network = new fbp.Network();

    var result = [];

    var sender = network.defProc(MockSender.generator([1, 2, 3, 4, 5]), "sender");
    var copier = network.defProc('./components/copier.js', "copier");
    var receiver = network.defProc(MockReceiver.generator(result), "receiver");

    network.connect(sender, 'OUT', copier, 'IN');
    network.connect(copier, 'OUT', receiver, 'IN');

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result).to.deep.equal([1, 2, 3, 4, 5]);
      done();
    });
  });
});
