var _ = require('lodash');
var IP = require('../../core/IP');
var sync = require('synchronize');
var PortScaffold = require('./PortScaffold');
var RuntimeScaffold = require('./RuntimeScaffold');

var ComponentScaffold = function (options) {
  if(typeof options !== 'object') {
    throw new Error('ComponentScaffold needs port information and (optionally) tests.');
  }
  this.inports = _.reduce(options.inports, function(inports, buffer, portname) {
    inports[portname] = new PortScaffold({
      name: portname,
      type: "IN",
      buffer: ComponentScaffold.makeIPs(buffer)
    });

    return inports;
  }, {});

  this.inports = _.reduce(options.iips, function(inports, buffer, portname) {
    inports[portname] = new PortScaffold({
      name: portname,
      type: "IIP",
      buffer: ComponentScaffold.makeIPs([buffer])
    });

    return inports;
  }, this.inports);

  this.outports = _.reduce(options.outports, function(outports, expectation, portname) {
    outports[portname] = {};

    outports[portname].port = new PortScaffold({
      name: portname,
      type: "OUT",
      buffer: []
    });
    outports[portname].expected = ComponentScaffold.makeIPs(expectation);

    return outports;
  }, {});

  this.droppedIPs = {
    expected: ComponentScaffold.makeIPs(options.droppedIPs || []),
    actual: []
  };

  this.tests = options.tests || [];
};


ComponentScaffold.prototype.openInputPortArray = function (portName) {
  var re = new RegExp(portName + '\\[\\d+\\]');

  const inports = this.inports;
  return Object.keys(inports)
    .filter(function (portName) {
      return re.test(portName);
    })
    .sort()
    .map(function (portName) {
      return inports[portName];
    });
};

ComponentScaffold.prototype.openInputPort = function (portName) {
  const inport = this.inports[portName];
  if(!inport) {
    console.error('Request for non-existent port: ' + portName);
  }
  return inport;
};

ComponentScaffold.prototype.openOutputPortArray = function (portName) {
  var re = new RegExp(portName + '\\[\\d+\\]');

  const outports = this.outports;
  return Object.keys(outports)
    .filter(function (portName) {
      return re.test(portName);
    })
    .sort()
    .map(function (portName) {
      return outports[portName].port;
    });
};

ComponentScaffold.prototype.openOutputPort = function (portName) {
  const outport = this.outports[portName].port;
  if(!outport) {
    console.error('Request for non-existent port: ' + portName);
  }
  return outport;
};

ComponentScaffold.prototype.dropIP = function(ip) {
  this.droppedIPs.actual.push(ip);
};

ComponentScaffold.makeIPs = function (values) {
  return values.map(function (val) {
    if(val.hasOwnProperty('type') && val.hasOwnProperty('owner')) {
      return val
    } else {
      return new IP(val);
    }
  });
};

ComponentScaffold.openIP = function () {
  var ip = new IP();
  ip.type = IP.Types.OPEN;
  return ip;
};

ComponentScaffold.closeIP = function () {
  var ip = new IP();
  ip.type = IP.Types.CLOSE;
  return ip;
};

ComponentScaffold.prototype.run = function (component, cb) {
  var runtime = new RuntimeScaffold();
  const mockProcess = {
    dropIP: this.dropIP.bind(this),
    openInputPort: this.openInputPort.bind(this),
    openInputPortArray: this.openInputPortArray.bind(this),
    openOutputPort: this.openOutputPort.bind(this),
    openOutputPortArray: this.openOutputPortArray.bind(this),
    IPTypes: IP.Types,
    createIPBracket: function (type) {
      var ip = new IP();
      ip.type = type;
      return ip;
    },
    createIP: function (value) {
      return new IP(value);
    }
  };
  if(cb) {
    sync.fiber(function () {
      component.call(mockProcess, runtime);
      cb();
    })
  } else {
    component.call(mockProcess, runtime);
  }
};

ComponentScaffold.prototype.verifyOutputs = function(expect) {
  _.forEach(this.outports, function (portInfo) {
    expect(portInfo.expected.length).to.be.equal(portInfo.port.getBuffer().length);
    _.forEach(_.zip(portInfo.expected, portInfo.port.getBuffer().actual), _.spread(function(exp, act) {
      expect(exp).to.equalPropertiesOn(act);
    }));
  })
};

ComponentScaffold.prototype.verifyDroppedIPs = function (expect) {
  expect(this.droppedIPs.expected.length).to.be.equal(this.droppedIPs.actual.length);
  _.forEach(_.zip(this.droppedIPs.expected, this.droppedIPs.actual), _.spread(function(exp, act) {
    expect(exp).to.equalPropertiesOn(act);
  }));
};

ComponentScaffold.prototype.runTests = function (it) {
  _.forEach(this.tests, function (test, description) {
    it(description, test);
  })
};


module.exports = ComponentScaffold;