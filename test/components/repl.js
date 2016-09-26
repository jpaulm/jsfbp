'use strict';

var repl = require('../../components/repl');

describe('repl', function () {
  it('should replicate multiple IPs', function () {
    var scaffold = new ComponentScaffold({
        inports: {
          IN: [1, 2, 3, 4, 5]
        },
        outports: {
          'OUT[0]': [1, 2, 3, 4, 5],
          'OUT[1]': [1, 2, 3, 4, 5]
        },
        droppedIPs: []
      }
    );

    scaffold.run(repl);
    scaffold.verifyOutputs(expect);
    scaffold.verifyDroppedIPs(expect);
    scaffold.runTests(it);
  });

  it('should replicate brackets', function () {
    var scaffold = new ComponentScaffold({
        inports: {
          IN: [ComponentScaffold.openIP(), 7, 6, 5, ComponentScaffold.closeIP()]
        },
        outports: {
          'OUT[0]': [ComponentScaffold.openIP(), 7, 6, 5, ComponentScaffold.closeIP()],
          'OUT[1]': [ComponentScaffold.openIP(), 7, 6, 5, ComponentScaffold.closeIP()]
        },
        droppedIPs: []
      }
    );

    scaffold.run(repl);
    scaffold.verifyOutputs(expect);
    scaffold.verifyDroppedIPs(expect);
    scaffold.runTests(it);
  });
});
