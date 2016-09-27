'use strict';

var bwriter = require('../../components/bwriter');
var fs = require('fs');
var _ = require('lodash');

var EOL = require('os').EOL;
var EOL_BYTES = _.invokeMap(EOL.split(''), 'charCodeAt', 0);

var GOODBYE_CONTENT = [ComponentScaffold.openIP(),
  71,
  111,
  111,
  100,
  98,
  121,
  101,
  0x20,
  87,
  111,
  114,
  108,
  100]
  .concat(EOL_BYTES)
  .concat(ComponentScaffold.closeIP());


describe('bwriter', function () {
  it('should write incoming IPs to a file', function (done) {
    var scaffold = new ComponentScaffold({
        iips: {
          'FILE': __dirname+'/goodbye-world.txt'
        },
        inports: {
          IN: GOODBYE_CONTENT
        },
        outports: {},
        droppedIPs: [__dirname+'/goodbye-world.txt'].concat(GOODBYE_CONTENT)
      }
    );

    scaffold.run(bwriter, function () {
      scaffold.verifyOutputs(expect);
      scaffold.verifyDroppedIPs(expect);
      scaffold.runTests(it);
      fs.readFile(__dirname+'/goodbye-world.txt', 'utf-8', function(err, data) {
        if(err) {
          return done(err);
        }
        expect(data).to.equal("Goodbye World"+EOL);
        done();
      });
    });
  });

  it('supports setting chunk sizes', function (done) {
    var scaffold = new ComponentScaffold({
        iips: {
          'FILE': __dirname+'/goodbye-world.txt',
          'SIZE': 100
        },
        inports: {
          IN: GOODBYE_CONTENT
        },
        outports: {},
        droppedIPs: [100,
          __dirname+'/goodbye-world.txt'].concat(GOODBYE_CONTENT)
      }
    );

    scaffold.run(bwriter, function () {
      scaffold.verifyOutputs(expect);
      scaffold.verifyDroppedIPs(expect);
      scaffold.runTests(it);
      fs.readFile(__dirname+'/goodbye-world.txt', 'utf-8', function(err, data) {
        if(err) {
          return done(err);
        }
        expect(data).to.equal("Goodbye World"+EOL);
        done();
      });
    });
  });
});