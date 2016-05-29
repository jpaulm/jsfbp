/**
 * Created by danrumney on 5/29/16.
 */

var Network = require('../../core/Network');

describe('Network', function() {
  it('respects explicitly named Processes', function () {
    var network = new Network();

    var process = network.defProc(function(){}, 'dummy_name');

    expect(process.name).to.be.equal('dummy_name');
  });

  it('infers Process names from named functions', function () {
    var network = new Network();

    var process = network.defProc(function dummy_name(){});

    expect(process.name).to.be.equal('dummy_name');
  });

  it('creates names for Processes when passed a template', function () {
    var network = new Network();

    var process = network.defProc(function(){}, 'dummy_XXX');
    expect(process.name).to.be.equal('dummy_000');
    process = network.defProc(function(){}, 'dummy_XXX');
    expect(process.name).to.be.equal('dummy_001');
    process = network.defProc(function(){}, 'dummy_XXX');
    expect(process.name).to.be.equal('dummy_002');
    process = network.defProc(function(){}, 'dummy_XX');
    expect(process.name).to.be.equal('dummy_00');
  });

  it('automatically names Processes derived from anonymous functions', function () {
    var network = new Network();

    var process = network.defProc(function (){});
    expect(process.name).to.be.equal('PROC_000');
    
    process = network.defProc(function (){});
    expect(process.name).to.be.equal('PROC_001');
  });


});
