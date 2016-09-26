'use strict';

var breader = require('../../components/breader');
var _ = require('lodash');
var EOL = require('os').EOL;
var eolBytes = _.invokeMap(EOL.split(''), 'charCodeAt', 0);


describe('breader', function () {

  it('should read a file and output its contents as bytes', function (done) {
    var scaffold = new ComponentScaffold({
        iips: {
          'FILE': __dirname + '/hello-world.txt'
        },
        inports: {},
        outports: {
          OUT: [ComponentScaffold.openIP(), 72, 101, 108, 108, 111, 0x20, 87, 111, 114, 108, 100, ComponentScaffold.closeIP()].concat(eolBytes)
        },
        droppedIPs: [__dirname + '/hello-world.txt']
      }
    );

    scaffold.run(breader, function () {
      scaffold.verifyOutputs(expect);
      scaffold.verifyDroppedIPs(expect);
      scaffold.runTests(it);
      done();
    });
  });

  it('supports setting chunk sizes', function (done) {
    var scaffold = new ComponentScaffold({
        iips: {
          'FILE': __dirname + '/hello-world.txt',
          'SIZE': 100
        },
        inports: {},
        outports: {
          OUT: [ComponentScaffold.openIP(), 72, 101, 108, 108, 111, 0x20, 87, 111, 114, 108, 100, ComponentScaffold.closeIP()].concat(eolBytes)
        },
        droppedIPs: [ 100, __dirname + '/hello-world.txt']
      }
    );

    scaffold.run(breader, function () {
      scaffold.verifyOutputs(expect);
      scaffold.verifyDroppedIPs(expect);
      scaffold.runTests(it);
      done();
    });
  });

});