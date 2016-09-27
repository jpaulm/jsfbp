'use strict';

var gendata = require('../../components/gendata');

describe('gendata', function () {
  it('generates incrementing IPs according to the IN port', function () {
    var scaffold = new ComponentScaffold({
      inports: {
          'IN': [9]
        },
        outports: {
          OUT: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        droppedIPs: [9]
      }
    );

    scaffold.run(gendata);
    scaffold.verifyOutputs(expect);
    scaffold.verifyDroppedIPs(expect);
    scaffold.runTests(it);
  });
});
