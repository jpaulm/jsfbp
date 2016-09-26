'use strict';

var discard = require('../../components/discard');

describe('discard', function () {
  it('should discard a single IP', function () {
    var scaffold = new ComponentScaffold({
        inports: {
          IN: [1, 2, 3, 4]
        },
        outports: {
          OUT: []
        },
        droppedIPs: [1, 2, 3, 4]
      }
    );

    scaffold.run(discard);

    scaffold.verifyOutputs(expect);
    scaffold.verifyDroppedIPs(expect);
    scaffold.runTests(it);
  });
});
