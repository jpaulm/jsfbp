'use strict';

var fbp = require('../..');

describe('delay', function() {
  it('should exactly delay a single IP', function(done) {
    var DELAY = 1000;
    var DELAY_MAX_DIFF = 150;
    this.timeout(DELAY + DELAY_MAX_DIFF);
    
    var network = new fbp.Network();
    
    var result = [];

    var sender   = network.defProc(MockSender([42]));
    var delay    = network.defProc('./components/delay.js');
    var receiver = network.defProc(MockReceiver(result));

    network.initialize(delay, 'INTVL', DELAY);
    network.connect(sender, 'OUT', delay, 'IN', 5);
    network.connect(delay, 'OUT', receiver, 'IN');
    
    var startTime = Date.now();
    
    network.run(new fbp.FiberRuntime(), { trace: true }, function () {
      expect(result).to.deep.equal([42]);
      var diffTime = Date.now() - startTime;
      expect(Math.abs(diffTime - DELAY)).to.be.below(DELAY_MAX_DIFF);
      done();
    });
  });
  
  it('should exactly delay multiple IPs', function(done) {
    done();return;
    var DELAY = 1000;
    var DELAY_MAX_DIFF = 150;
    this.timeout(DELAY + DELAY_MAX_DIFF);
    
    var network = new fbp.Network();
    
    var result = [];

    var sender   = network.defProc(MockSender([1,2,3]));
    var delay    = network.defProc('./components/delay.js');
    var receiver = network.defProc(MockReceiver(result));

    network.initialize(delay, 'INTVL', DELAY);
    network.connect(sender, 'OUT', delay, 'IN', 5);
    network.connect(delay, 'OUT', receiver, 'IN');
    
    var startTime = Date.now();
    
    network.run(new fbp.FiberRuntime(), { trace: false }, function () {
      expect(result).to.deep.equal([1,2,3]);
      var diffTime = Date.now() - startTime;
      expect(Math.abs(diffTime - DELAY)).to.be.below(DELAY_MAX_DIFF);
      done();
    });
  });
});
