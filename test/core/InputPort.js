/**
 * Created by danrumney on 5/27/16.
 */

var InputPort = require('../../core/InputPort');
var IIPConnection = require('../../core/IIPConnection');
var ProcessConnection = require('../../core/ProcessConnection');
var IP = require('../../core/IP');
var FiberRuntime = require('../../core/runtimes/FiberRuntime');


var getTestInPort = function (connection) {
  var fiberRuntime = new FiberRuntime();
  var inPort = new InputPort();
  inPort.name = "Test InPort";
  connection.setRuntime(fiberRuntime);
  inPort.conn = connection;
  return inPort;
};

describe.skip('InputPort', function() {


  it('can receive IIPs', function(done) {
    var inPort = getTestInPort(new IIPConnection("test"));

    global.tracing= true;

    TestFiber(function(mockProcess) {
      var ip = inPort.receive();

      expect(ip.contents).to.be.equal('test');
      expect(ip.owner).to.be.equal(mockProcess);
      expect(ip.type).to.be.equal(IP.NORMAL);

      done();
    });
  });

  it('returns null from a closed connection', function(done) {
    var inPort = getTestInPort(new ProcessConnection(1));
    inPort.conn.closed = true;

    global.tracing= true;

    TestFiber(function() {
      var ip = inPort.receive();

      expect(ip).to.be.null;

      done();
    });
  })
});
