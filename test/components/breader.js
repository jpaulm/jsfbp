'use strict';

var fbp = require('../..');

describe('breader', function () {
  it('should read a file and output its contents as bytes', function (done) {
    var network = new fbp.Network();

    var result = [];

    var breader = network.defProc('./components/breader.js');
    var receiver = network.defProc(MockReceiver.generator(result));

    network.initialize(breader, 'FILE', __dirname+'/hello-world.txt');
    network.connect(breader, 'OUT', receiver, 'IN');

    var fiberRuntime = new fbp.FiberRuntime();
    network.run(fiberRuntime, {trace: false}, function() {
      expect(result).to.deep.equal([72, 101, 108, 108, 111, 0x20, 87, 111, 114, 108, 100, 0x0A]);
      done();
    });
  });
});
