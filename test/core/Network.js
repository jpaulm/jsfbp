var Network = require('../../core/Network');
var fbp = require('../..');
var fs = require('fs');

describe('Network', function () {
  it('can load FBP components from this module\'s core via path', function () {
    var network = new Network();
    var process = network.defProc('./components/copier.js');

    expect(process.func).to.be.a('function');
  });

  it('can load FBP components from this module\'s core via package/component', function () {
    var network = new Network();
    var process = network.defProc('jsfbp/copier');

    expect(process.func).to.be.a('function');
  });

  it('can load FBP components directly from modules', function () {
    var network = new Network();
    var process = network.defProc('dummy-module');

    expect(process.func).to.be.an('object');
  });

  it('can load FBP components that are part of a larger package', function () {
    var network = new Network();
    var process = network.defProc('dummy-module/getP3');

    expect(process.func).to.be.an('function');
  });

  it('can be created from an FBP file', function (done) {
    fs.readFile(__dirname + '/network.fbp', function (err, graph) {
      if (err) {
        return done(err);
      }

      var network = Network.createFromGraph(graph.toString());

      var fiberRuntime = new fbp.FiberRuntime();
      network.run(fiberRuntime, {trace: false});

      var receiverProcess = network.getProcessByName("receiver");
      var result = receiverProcess.func.getResult();

      expect(result).to.deep.equal(['1,m1', '1,d11', '1,d12', '2,m2', '2,d21', '3,m3', '3,d31', '3,d32', '3,d33', '4,d41']);

      done();
    });
  });

  it('correctly identifies empty IIPs', function () {
    expect(function () {
      Network.createFromGraph("'' -> IN RECVR(jsfbp/recvr)");
    }).not.to.throw(Error);
  });

  it('supports IIPs and OutPorts feeding into the same InPort', function(done) {
    var network = new Network();
    var result = [];

    var receiver = network.defProc(MockReceiver.generator(result), "RECVR");
    var delay = network.defProc('jsfbp/delay', "DELAY");

    //network.initialize(receiver, 'IN', 1); // If you initialize here, an error is thrown
    network.connect(delay, 'OUT', receiver, 'IN');
    network.initialize(receiver, 'IN', 1); //If you initialize here, RECVR never gets the IIP

    network.initialize(delay,'INTVL', 50);
    network.initialize(delay,'IN', 2);

    network.run(new fbp.FiberRuntime(), {trace: true}, function () {
      expect(result).to.deep.equal([1, 2]);
      done();
    });
  });

  it('supports merge points into the same InPort', function(done) {
    var network = new Network();
    var result = [];

    var receiver = network.defProc(MockReceiver.generator(result), "RECVR");
    var delay0 = network.defProc('jsfbp/delay', "DELAY0");
    var delay1 = network.defProc('jsfbp/delay', "DELAY1");
    var copy0 = network.defProc('jsfbp/copier', "COPY0");
    var copy1 = network.defProc('jsfbp/copier', "COPY1");


    network.connect(delay0, 'OUT', copy0, 'IN');
    network.connect(delay1, 'OUT', copy1, 'IN');
    network.connect(copy0, 'OUT', receiver, 'IN');
    network.connect(copy1, 'OUT', receiver, 'IN');

    network.initialize(delay0,'INTVL', 500);
    network.initialize(delay0,'IN', 1);
    network.initialize(delay1,'INTVL', 1000);
    network.initialize(delay1,'IN', 2);

    network.run(new fbp.FiberRuntime(), {trace: true}, function () {
      expect(result).to.deep.equal([2, 1]);
      done();
    });
  });
});
