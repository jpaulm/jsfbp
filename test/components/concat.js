'use strict';

var concat = require('../../components/concat');

describe('concat', function () {
  it('concatenates all incoming IPs to a single output port', function () {
    var scaffold = new ComponentScaffold({
        inports: {
          'IN[0]': [1, 2, 3],
          'IN[1]': [4, 5, 6]
        },
        outports: {
          OUT: [1, 2, 3, 4, 5, 6]
        },
        droppedIPs: []
      }
    );

    scaffold.run(concat);
    scaffold.verifyOutputs(expect);
    scaffold.verifyDroppedIPs(expect);
    scaffold.runTests(it);
  });
});
