'use strict';

var fbp = require('../..');

describe('repl', function () {
  it('should replicate multiple IPs', function (done) {
    var network = new fbp.Network();

    var result1 = [];
    var result2 = [];

    var sender = network.defineProcess(MockSender.generator([1, 2, 3, 4, 5]), "sender");
    var repl = network.defineProcess('./components/repl.js', "repl");
    var receiver1 = network.defineProcess(MockReceiver.generator(result1), "receiver1");
    var receiver2 = network.defineProcess(MockReceiver.generator(result2), "receiver2");

    network.connect(sender, 'OUT', repl, 'IN');
    network.connect(repl, 'OUT[0]', receiver1, 'IN');
    network.connect(repl, 'OUT[1]', receiver2, 'IN');

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result1).to.deep.equal([1, 2, 3, 4, 5]);
      expect(result2).to.deep.equal([1, 2, 3, 4, 5]);
      done();
    });
  });

  it('should replicate brackets', function (done) {
    var network = new fbp.Network();

    var result1 = [];
    var result2 = [];

    var sender = network.defineProcess(MockSender.generator(["IP.OPEN", 7, 6, 5, "IP.CLOSE"]), 'sender');
    var repl = network.defineProcess('./components/repl.js', "repl");
    var receiver1 = network.defineProcess(MockReceiver.generator(result1), "receiver1");
    var receiver2 = network.defineProcess(TypeReceiver.generator(result2), "receiver2");

    network.connect(sender, 'OUT', repl, 'IN');
    network.connect(repl, 'OUT[0]', receiver1, 'IN');
    network.connect(repl, 'OUT[1]', receiver2, 'IN');

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result1).to.deep.equal([7, 6, 5]);
      expect(result2).to.deep.equal([fbp.IPTypes.OPEN, fbp.IPTypes.NORMAL, fbp.IPTypes.NORMAL, fbp.IPTypes.NORMAL, fbp.IPTypes.CLOSE]);
      done();
    });
  })
});
