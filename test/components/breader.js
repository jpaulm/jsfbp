'use strict';

var fbp = require('../..');
var _ = require('lodash');
var EOL = require('os').EOL;

var eolBytes = _.invokeMap(EOL.split(''), 'charCodeAt', 0);

describe('breader', function () {
  it('should read a file and output its contents as bytes', function (done) {
    var network = new fbp.Network();

    var result = [];

    var breader = network.defProc('./components/breader.js', 'breader');
    var receiver = network.defProc(MockReceiver.generator(result), 'receiver');

    network.initialize(breader, 'FILE', __dirname+'/hello-world.txt');
    network.connect(breader, 'OUT', receiver, 'IN');

    var fiberRuntime = new fbp.FiberRuntime();
    network.run(fiberRuntime, {trace: false}, function() {
      expect(result).to.deep.equal([72, 101, 108, 108, 111, 0x20, 87, 111, 114, 108, 100].concat(eolBytes));
      done();
    });
  });

  it('supports setting chunk sizes', function (done) {
    var network = new fbp.Network();

    var result = [];

    var breader = network.defProc('./components/breader.js', 'breader');
    var receiver = network.defProc(MockReceiver.generator(result), 'receiver');

    network.initialize(breader, 'FILE', __dirname+'/hello-world.txt');
    network.initialize(breader, 'SIZE', '100');
    network.connect(breader, 'OUT', receiver, 'IN');

    var fiberRuntime = new fbp.FiberRuntime();
    network.run(fiberRuntime, {trace: false}, function() {
      expect(result).to.deep.equal([72, 101, 108, 108, 111, 0x20, 87, 111, 114, 108, 100].concat(eolBytes));
      done();
    });
  });
});
