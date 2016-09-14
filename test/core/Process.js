var Process = require('../../core/Process')
  , IP = require('../../core/IP')
  , TestRuntime = require('../TestRuntime');

describe('Process', function () {
  it('has zero or more simple inports', function () {
    var process = new Process({
      name: 'TEST'
      , component: function () {}
      , ports: { in: ['IN1', 'IN2'] }
    });
    expect(process.openInputPort('IN1')).to.be.an('object');
    expect(process.openInputPort('IN2')).to.be.an('object');
    expect(process.openInputPort('IN3')).to.be.null;
  });

  it('has zero or more simple outports', function () {
    var process = new Process({
      name: 'TEST'
      , component: function () {}
      , ports: { out: {'OUT1': {}, 'OUT2': {capacity: 5}}}
    });
    expect(process.openOutputPort('OUT1')).to.be.an('object');
    expect(process.openOutputPort('OUT1')).to.have.property('capacity').and.to.equal(20);
    expect(process.openOutputPort('OUT2')).to.be.an('object');
    expect(process.openOutputPort('OUT2')).to.have.property('capacity').and.to.equal(5);
    expect(process.openOutputPort('OUT3')).to.be.null;
  });

  it('can send IPs', function () {
    var testRuntime = new TestRuntime();

    var fbpProcess = new Process({
      name: 'TEST'
      , component: function () {}
      , ports: { out: {'OUT1': {}, 'OUT2': {capacity: 5}}}
      , runtime: testRuntime
    });

    var out1 = fbpProcess.openOutputPort('OUT1');
    var testIP = fbpProcess.createIP('test');
    expect(fbpProcess).to.have.property('ownedIPs').and.to.equal(1);
    out1.send(testIP);

    var dispatchedMessages = testRuntime.getDispatchedMessages('OUT1');
    expect(dispatchedMessages).to.have.length(1);
    expect(dispatchedMessages[0]).to.have.property('type').and.to.equal('ipAvailable');
    expect(testRuntime.outQueues['OUT1']).to.have.length(1);

    testRuntime.handle({type: 'pullIP',  to: { process: 'TEST', portName: 'OUT1' }});
    expect(fbpProcess).to.have.property('ownedIPs').and.to.equal(0);
    expect(testRuntime.outQueues['OUT1']).to.have.length(0);
  });

  it('can only send IPs that it owns', function() {
    var testRuntime = new TestRuntime();

    var fbpProcess = new Process({
      name: 'TEST'
      , component: function () {}
      , ports: { out: {'OUT1': {}, 'OUT2': {capacity: 5}}}
      , runtime: testRuntime
    });

    var out1 = fbpProcess.openOutputPort('OUT1');
    var testIP = new IP('test');
    expect(fbpProcess).to.have.property('ownedIPs').and.to.equal(0);

    expect(function () {
      out1.send(testIP);
    }).to.throw();
  });

  it('can handle outbound backpressure', function () {
    var testRuntime = new TestRuntime();

    var fbpProcess = new Process({
      name: 'TEST'
      , component: function () {}
      , ports: { out: {'OUT1': {capacity: 2}}}
      , runtime: testRuntime
    });

    var out1 = fbpProcess.openOutputPort('OUT1');
    var testIP = fbpProcess.createIP('test');
    out1.send(testIP);
    out1.send(fbpProcess.cloneIP(testIP));

    var dispatchedMessages = testRuntime.getDispatchedMessages('OUT1');
    expect(dispatchedMessages).to.have.length(2);
    expect(dispatchedMessages[0]).to.have.property('type').and.to.equal('ipAvailable');
    expect(dispatchedMessages[1]).to.have.property('type').and.to.equal('ipAvailable');
    expect(testRuntime.outQueues['OUT1']).to.have.length(2);
    expect(testRuntime.isWaiting).to.be.false;

    testRuntime.setWaitHandler(function () {
      dispatchedMessages = testRuntime.getDispatchedMessages('OUT1');
      expect(dispatchedMessages).to.have.length(2);
      expect(dispatchedMessages[0]).to.have.property('type').and.to.equal('ipAvailable');
      expect(dispatchedMessages[1]).to.have.property('type').and.to.equal('ipAvailable');
      expect(testRuntime.outQueues['OUT1']).to.have.length(2);
      expect(testRuntime.isWaiting).to.be.true;

      testRuntime.outQueues['OUT1'].dequeue();
      testRuntime.resume();

    });
    out1.send(fbpProcess.cloneIP(testIP));

    dispatchedMessages = testRuntime.getDispatchedMessages('OUT1');
    expect(dispatchedMessages).to.have.length(3);
    expect(dispatchedMessages[0]).to.have.property('type').and.to.equal('ipAvailable');
    expect(dispatchedMessages[1]).to.have.property('type').and.to.equal('ipAvailable');
    expect(dispatchedMessages[2]).to.have.property('type').and.to.equal('ipAvailable');
    expect(testRuntime.outQueues['OUT1']).to.have.length(2);
    expect(testRuntime.isWaiting).to.be.false;
  });

  it('can receive IPs that are already inbound', function () {
    var testRuntime = new TestRuntime();

    var fbpProcess = new Process({
      name: 'TEST'
      , component: function () {}
      , ports: { in: ['IN1']}
      , runtime: testRuntime
    });

    var in1 = fbpProcess.openInputPort('IN1');
    testRuntime.setWaitHandler(function () {
      return new IP('TEST');
    });

    var ip = in1.receive();

    var dispatchedMessages = testRuntime.getDispatchedMessages('IN1');
    expect(dispatchedMessages).to.have.length(1);
    expect(dispatchedMessages[0]).to.have.property('type').and.to.equal('readyForIP');
    expect(ip).to.have.property('type').and.to.equal(IP.Types.NORMAL);
    expect(ip).to.have.property('contents').and.to.equal('TEST');

    expect(ip).to.have.property('owner').and.to.equal(fbpProcess.name);
    expect(fbpProcess).to.have.property('ownedIPs').and.to.equal(1);
  });

  it('reports attempts to read from a closed input port', function () {
    var testRuntime = new TestRuntime();

    var fbpProcess = new Process({
      name: 'TEST'
      , component: function () {}
      , ports: { in: ['IN1']}
      , runtime: testRuntime
    });

    var in1 = fbpProcess.openInputPort('IN1');
    in1.close();
    expect(in1).to.have.property('closed').and.be.true;

    var ip = in1.receive();
    expect(ip).to.be.null;

  })

});