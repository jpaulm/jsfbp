'use strict';

var randdelay = require('../../components/randdelay');

describe('randdelay', function () {
  it('should randomly delay a single IP', function (done) {
    var DELAY = 500;
    var DELAY_MAX_DIFF = 150;
    this.timeout(DELAY + DELAY_MAX_DIFF);

    var scaffold = new ComponentScaffold({
        iips: {
          'INTVL': DELAY
        },
        inports: {
          IN: [ 42 ]
        },
        outports: {
          OUT: [ 42 ]
        },
        droppedIPs: [DELAY]
      }
    );


    var startTime = Date.now();
    scaffold.run(randdelay, function () {
      scaffold.verifyOutputs(expect);
      scaffold.verifyDroppedIPs(expect);
      scaffold.runTests(it);

      var diffTime = Date.now() - startTime;
      expect(Math.abs(diffTime - DELAY)).to.be.below(DELAY);

      done();
    });
  });

  it('should randomly delay multiple IPs', function (done) {
    var DELAY = 500;
    var DELAY_MAX_DIFF = 300;
    var DELAY_TOTAL = DELAY * 5;
    this.timeout(DELAY_TOTAL + DELAY_MAX_DIFF);

    var scaffold = new ComponentScaffold({
        iips: {
          'INTVL': DELAY
        },
        inports: {
          IN: [ 1, 2, 3, 4, 5 ]
        },
        outports: {
          OUT: [ 1, 2, 3, 4, 5 ]
        },
        droppedIPs: [DELAY]
      }
    );


    var startTime = Date.now();
    scaffold.run(randdelay, function () {
      scaffold.verifyOutputs(expect);
      scaffold.verifyDroppedIPs(expect);
      scaffold.runTests(it);

      var diffTime = Date.now() - startTime;
      expect(Math.abs(diffTime - DELAY_TOTAL)).to.be.below(DELAY_TOTAL);

      done();
    });
  });
});
