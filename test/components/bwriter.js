'use strict';

var fbp = require('../..');
var fs = require('fs');

describe('bwriter', function () {
  it('should write incoming IPs to a file', function (done) {
    var network = new fbp.Network();

    var sender = network.defProc(MockSender.generator(["IP.OPEN",
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
      100,
      0x0A
    ,"IP.CLOSE"]));
    var writer = network.defProc('./components/bwriter.js');
    //var receiver = network.defProc('./components/recvr');

    network.initialize(writer, 'FILE', __dirname+'/goodbye-world.txt');
    //network.connect(sender, 'OUT', receiver, 'IN');
    network.connect(sender, 'OUT', writer, 'IN');

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      fs.readFile(__dirname+'/goodbye-world.txt', 'utf-8', function(err, data) {
        if(err) {
          return done(err);
        }
        expect(data).to.equal("Goodbye World\n");
        done();
      });
    });
  });
});
