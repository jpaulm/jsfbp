'use strict';

var delay = require('../../components/delay');

describe('delay', function () {
  it('should exactly delay a single IP', function (done) {
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
    scaffold.run(delay, function () {
      scaffold.verifyOutputs(expect);
      scaffold.verifyDroppedIPs(expect);
      scaffold.runTests(it);

      var diffTime = Date.now() - startTime;
      expect(Math.abs(diffTime - DELAY)).to.be.below(DELAY_MAX_DIFF);

      done();
    });
  });

  it('should exactly delay multiple IPs', function (done) {
    var DELAY = 500;
    var DELAY_MAX_DIFF = 300;
    var TOTAL_DELAY = DELAY * 3;
    this.timeout(TOTAL_DELAY + DELAY_MAX_DIFF);

    var scaffold = new ComponentScaffold({
        iips: {
          'INTVL': DELAY
        },
        inports: {
          IN: [ 1, 2, 3 ]
        },
        outports: {
          OUT: [ 1, 2, 3 ]
        },
        droppedIPs: [DELAY]
      }
    );


    var startTime = Date.now();
    scaffold.run(delay, function () {
      scaffold.verifyOutputs(expect);
      scaffold.verifyDroppedIPs(expect);
      scaffold.runTests(it);

      var diffTime = Date.now() - startTime;
      expect(Math.abs(diffTime - TOTAL_DELAY)).to.be.below(DELAY_MAX_DIFF);

      done();
    });
  });
});
