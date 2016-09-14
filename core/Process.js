/**
 * Created by danrumney on 6/15/16.
 */
var DefaultRuntime = require('./DefaultRuntime')
  , trace = require('./trace')
  , _ = require('lodash')
  , Fiber = require('fibers')
  , IP = require('../core/IP')
  , FIFO = require('./FIFO');


/*
 * This function provides support for loading
 * - components that come _with_ this module -> './components/copier.js'
 * - components that are inside a package -> 'package/component'
 * - components that are simply a node module -> 'component'
 * - components that are local to the application trying to load them
 */

function loadComponent(componentDetails) {
  var moduleLocation = componentDetails.moduleLocation;
  var componentField = componentDetails.componentField;

  trace("Trying to load: " + require.resolve(moduleLocation));
  var component = require(moduleLocation);

  if (componentField) {
    return component[componentField]
  } else {
    return component;
  }
}


function _receive(portName) {
  if(this.inports[portName].closed) {
    console.log('Reading from closed port: "' + portName +'"');
    return null;
  }
  this.runtime.dispatch('readyForIP').from(portName);
  var ip = this.runtime.wait();
  ip.owner = this.name;
  this.ownedIPs++;
  return ip;
}

function _send(portName, ip) {
  if(ip.owner !== this.name) {
    throw 'Cannot send an IP that this process does not own';
  }
  var sendQueue = this.outQueues[portName];
  while (sendQueue.length >= this.getCapacity(portName)) {
    this.runtime.wait();
  }
  sendQueue.enqueue(ip);
  this.runtime.dispatch('ipAvailable').from(portName);
}

function _closePort(portName, ports) {
  this[ports][portName].closed = true;
  this.runtime.dispatch('closing').from(portName);
}

/*
 * Process object definition starts here
 */

var DEFAULT_CAPACITY = 20;

var Process = function (options) {
  this.name = options.name;
  this.componentModule = options.component;

  var process = this;
  this.inports = _.reduce(options.ports.in, function (ports, portName) {
    ports[portName] = {
      name: portName,
      process: process,
      receive: _receive.bind(process, portName),
      close: _closePort.bind(process, portName, 'inports'),
      closed: true
    };
    return ports;
  }, {});
  this.outports = options.ports.out;
  this.outQueues = {};

  this.ownedIPs = 0;

  var runtime = this.runtime = options.runtime || new DefaultRuntime(this.name);
  runtime.setOutQueues(this.outQueues);



  this.runtime.addHandler('incomingIP', function (message) {
    runtime.resume(message.ip);
  });

  this.runtime.addHandler('pullIP', function (message) {
    var portName = message.to.portName;
    var ip = runtime.outQueues[portName].dequeue();
    ip.owner = null;
    runtime.dispatch('sendIP', ip).from(portName);
    process.ownedIPs--;
    runtime.resume();
  });

  this.runtime.addHandler('downstreamClosed', function (message) {
    var portName = message.to.portName;
    const pendingIPs = runtime.outQueues[portName].length;
    if(pendingIPs > 0) {
      console.error('Connection closed from "' + portName + '" results in ' + pendingIPs + ' IPs being dropped');
    }
    runtime.outQueues[portName].purge();
    process.outports[portName].closed = true;
  });
};

Process.prototype.openInputPort = function (portName) {
  if (this.inports[portName]) {
    this.inports[portName].closed = false;
    return this.inports[portName];
  } else {
    console.error('Port "' + portName + '" does not exist in process "' + this.name + '"');
    return null;
  }
};

Process.prototype.openOutputPort = function (portName) {
  if (this.outports[portName]) {
    this.outQueues[portName] = new FIFO();
    this.outports[portName].closed = false;
    return {
      name: portName,
      process: this,
      send: _send.bind(this, portName),
      close: _closePort.bind(this, portName, 'outports'),
      capacity: this.outports[portName].capacity || DEFAULT_CAPACITY
    };
  } else {
    console.error('Port "' + portName + '" does not exist in process "' + this.name + '"');
    return null;
  }
};

Process.prototype.getCapacity = function (portName) {
  return this.outports[portName].capacity || DEFAULT_CAPACITY;
};

Process.prototype.activateComponent = function () {
  if (!this.fiber) {
    this.fiber = Fiber(this.componentModule.bind(this));
  }
  this.fiber.run();
};

if (process.send) {
  (function (networkName, componentLocation, processName, ports) {
    console.log(ports);
    var component = loadComponent(componentLocation);
    var fbpProcess = new Process(processName, component, ports);

    process.on('startWhenReady', function () {
        fbpProcess.activateComponent();
      });
  }).apply(process.argv.slice(2));
} else {
  module.exports = Process;
}


Process.prototype.createIP = function (data) {
  var ip = IP.create(IP.Types.NORMAL, data, this.name);
  this.ownedIPs++;
  trace("Normal IP created: " + ip.contents);
  return ip;
};

Process.prototype.cloneIP = function (ip) {
  var clonedIP = IP.create(ip.type, ip.data, this.name);
  this.ownedIPs++;
  trace("IP cloned: " + ip);
  return clonedIP;
};

Process.prototype.createIPBracket = function (bktType, x) {
  var ip = IP.create(bktType, x, this.name);
  this.ownedIPs++;

  trace("Bracket IP created: " + this.IPTypes.__lookup(ip.type) + ", " + ip.contents);

  return ip;
};

Process.prototype.dropIP = function (ip) {
  if (ip.owner != this.name) {
    console.log(this.name + ' IP being dropped not owned by this Component: ' + ip);
    return;
  }

  trace('IP dropped: ' + ip);
  this.ownedIPs--;
  ip.owner = null;
};