var Network = require('../../core/Network');
var fbp = require('../..');
var fs = require('fs');

describe('Network', function () {
  it('can load FBP components from this module\'s core via path', function () {
    var network = new Network();
    var process = network.defProc('./components/copier.js', 'copier');

    expect(process.func).to.be.a('function');
  });

  it('can load FBP components from this module\'s core via package/component', function () {
    var network = new Network();
    var process = network.defProc('jsfbp/copier', "copier");

    expect(process.func).to.be.a('function');
  });

  it('can load FBP components directly from modules', function () {
    var network = new Network();
    var process = network.defProc('dummy-module', "dummy");

    expect(process.func).to.be.an('object');
  });

  it('can load FBP components that are part of a larger package', function () {
    var network = new Network();
    var process = network.defProc('dummy-module/getP3', 'getP3');

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

  it('supports connection capacity', function () {
    var network = Network.createFromGraph("'2' -> IN GEN(jsfbp/gendata) OUT -> (100) IN RECVR(jsfbp/recvr)");
    expect(network._connections[0].capacity).to.equal(100);

    network = Network.createFromGraph("'2' -> IN GEN(jsfbp/gendata) OUT ->  IN RECVR(jsfbp/recvr)");
    expect(network._connections[0].capacity).to.equal(10);
  })
});
