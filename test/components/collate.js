'use strict';

var collate = require('../../components/collate');

describe('collate', function () {
  it('should collate based on a single field', function () {
    var scaffold = new ComponentScaffold({
        iips: {
          'CTLFIELDS': '1'
        },
        inports: {
          'IN[0]': ['1,m1', '2,m2', '3,m3'],
          'IN[1]': ['1,d11', '1,d12', '2,d21', '3,d31', '3,d32', '3,d33', '4,d41']
        },
        outports: {
          OUT: [
            ComponentScaffold.openIP(), '1,m1', '1,d11', '1,d12', ComponentScaffold.closeIP(),
            ComponentScaffold.openIP(), '2,m2', '2,d21', ComponentScaffold.closeIP(),
            ComponentScaffold.openIP(), '3,m3', '3,d31', '3,d32', '3,d33', ComponentScaffold.closeIP(),
            ComponentScaffold.openIP(), '4,d41', ComponentScaffold.closeIP()]
        },
        droppedIPs: [ '1' ]
      }
    );

    scaffold.run(collate);
    scaffold.verifyOutputs(expect);
    scaffold.verifyDroppedIPs(expect);
    scaffold.runTests(it);
  });
});
