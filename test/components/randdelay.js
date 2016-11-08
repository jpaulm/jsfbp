'use strict';

var fbp = require('../..');

describe('randdelay', function () {
  it('should randomly delay a single IP', function (done) {
    var DELAY = 1000;
    var DELAY_MAX_DIFF = 150;
    this.timeout(DELAY + DELAY_MAX_DIFF);

    var network = new fbp.Network();

    var result = [];

    var sender = network.defProc(MockSender.generator([42]), "sender");
    var delay = network.defProc('./components/randdelay.js', "randdelay");
    var receiver = network.defProc(MockReceiver.generator(result), "receiver");

    network.initialize(delay, 'INTVL', DELAY);
    network.connect(sender, 'OUT', delay, 'IN');
    network.connect(delay, 'OUT', receiver, 'IN');

    var startTime = Date.now();

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result).to.deep.equal([42]);
      var diffTime = Date.now() - startTime;
      expect(Math.abs(diffTime - DELAY)).to.be.within(0, DELAY);
      done();
    });
  });

  it('should randomly delay multiple IPs', function (done) {
    var DELAY = 1000;
    var DELAY_MAX_DIFF = 300;
    var DELAY_TOTAL = DELAY * 5;
    this.timeout(DELAY_TOTAL + DELAY_MAX_DIFF);

    var network = new fbp.Network();

    var result = [];
    var startTime;

    var i = 0;
    var mockReceiver = MockReceiver.generator(result, function receive() {
      i++;
      var diffTime = Date.now() - startTime;
      expect(Math.abs(diffTime - DELAY)).to.be.within(0, DELAY * i + DELAY_MAX_DIFF);
      console.log("DELAY " + diffTime);
    });

    var sender = network.defProc(MockSender.generator([1, 2, 3, 4, 5]), "sender");
    var delay = network.defProc('./components/randdelay.js', "delay");
    var receiver = network.defProc(mockReceiver, "receiver");

    network.initialize(delay, 'INTVL', DELAY);
    network.connect(sender, 'OUT', delay, 'IN');
    network.connect(delay, 'OUT', receiver, 'IN');

    startTime = Date.now();

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result).to.have.members([1, 2, 3, 4, 5]);
      done();
    });
  });
});
