var Network = require('../../core/Network');

describe('Network', function () {
  it('can load FBP components from this module\'s core', function() {
    var network = new Network();
    var process = network.defProc('./components/copier.js');

    expect(process.func).to.be.a('function');
  });

  it('can load FBP components directly from modules', function() {
    var network = new Network();
    var process = network.defProc('dummy-module');

    expect(process.func).to.be.an('object');
  });

  it('can load FBP components that are part of a larger package', function() {
    var network = new Network();
    var process = network.defProc('dummy-module/getP3');

    expect(process.func).to.be.an('function');
  });
});
