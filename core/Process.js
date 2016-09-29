'use strict';


var Fiber = require('fibers'),
  Enum = require('./Enum'),
  IP = require('./IP'),
  InputPort = require('./InputPort'),
  OutputPort = require('./OutputPort'),
  osProcess = require('process');

var Process = module.exports = function () {
  this.inports = {};
  this.outports = {};
  this._status = Process.Status.NOT_INITIALIZED;
  this.ownedIPs = 0;
  console.log("Process created\n");

  osProcess.once('message', function (message) {
    if (message.type !== "INITIALIZE") {
      throw new Error("Uninitialized Process received message that wasn't 'INITIALIZE'");
    }
    var details = message.details;

    this.component = require(details.component.moduleLocation);
    if (details.component.componentField) {
      this.component = details.component.componentField;
    }

    var process = this;

    details.in.forEach(function (portName) {
      var inputPort = new InputPort(process, portName);
      inputPort.on("ipRequested", function (e) {
        osProcess.send('message', {
          type: "IP_REQUESTED",
          details: {
            process: process.name,
            port: e.portName
          }
        });
        process.setStatus(Process.Status.WAITING_TO_RECEIVE);

        osProcess.once('message', function (message) {
          if (message.type === 'IP_INBOUND') {
            var details = message.details;
            var ip = details.ip;
            Fiber.current.run(ip);
          }
        });
      });
      return inputPort;
    });

    details.out.forEach(function (portName) {
      var outputPort = new OutputPort(process, portName);
      outputPort.on("ipSubmitted", function (e) {
        osProcess.send('message', {
          type: "IP_AVAILABLE",
          details: {
            process: process.name,
            port: e.portName,
            ip: e.ip
          }
        });
        osProcess.once('message', function (message) {
          if (message.type === 'IP_ACCEPTED') {
            process.setStatus(Process.Status.ACTIVE);
            Fiber.current.run();
          }
        });
        process.setStatus(Process.Status.WAITING_TO_SEND);
      });
      return outputPort;
    });
    this.selfStarting = details.selfStarting;
    this.name = details.name;

    console.log("Process initialized: " + this);
    this.setStatus(Process.Status.INITIALIZED);
  }.bind(this))

};

Process.Status = Enum([
  'NOT_INITIALIZED',
  'INITIALIZED',
  'ACTIVE',
  'WAITING_TO_RECEIVE',
  'WAITING_TO_SEND',
  'DORMANT',
  'CLOSED',
  'DONE'
]);

Process.prototype.setStatus = function (newStatus) {
  var oldStatus = this._status;
  this._status = newStatus;

  osProcess.send({
    type: "STATUS_UPDATE",
    name: this.name,
    oldStatus: oldStatus,
    newStatus: newStatus
  }, function (error) {
    if (error) {
      console.error(error);
    }
  });
};

Process.prototype.IPTypes = IP.Types;

Process.prototype.toString = function () {
  return "Process: { \n" +
    "  name: " + this.name + "\n" +
    "  inports: " + Object.keys(this.inports) + "\n" +
    "  outports: " + Object.keys(this.outports) + "\n" +
    "  status: " + this.getStatusString() + "\n" +
    "  selfStarting: " + this.isSelfStarting() + "\n" +
    "}";
};


/*
 * Given a set of ports an a base name XXX, returns all the ports in the set that
 * have the name XXX[<index>]
 */
function getPortArray(ports, name) {
  var re = new RegExp(name + '\\[\\d+\\]');

  return Object.keys(ports)
    .filter(function (portName) {
      return re.test(portName);
    })
    .sort()
    .map(function (portName) {
      return ports[portName];
    });
}

Process.prototype.getStatusString = function () {
  return Process.Status.__lookup(this._status);
};

Process.prototype.isSelfStarting = function () {
  return this.selfStarting;
};

Process.prototype.createIP = function (data) {
  var ip = new IP(data);
  this.ownedIPs++;
  ip.owner = this;
  return ip;
};

Process.prototype.createIPBracket = function (bktType, x) {
  if (x == undefined) {
    x = null;
  }
  var ip = this.createIP(x);
  ip.type = bktType;

  return ip;
};

Process.prototype.disownIP = function (ip) {
  if (ip.owner != this) {
    throw new Error(this.name + ' IP being disowned is not owned by this Process: ' + ip);
  }
  this.ownedIPs--;
  ip.owner = null;
};

Process.prototype.dropIP = function (ip) {
  var cont = ip.contents;
  if (ip.type != this.IPTypes.NORMAL) {
    cont = this.IPTypes.__lookup(ip.type) + ", " + cont;
  }

  this.disownIP(ip);
};

Process.prototype.addInputPort = function (port) {
  this.inports[port.portName] = port;
};
Process.prototype.addOutputPort = function (port) {
  this.outports[port.portName] = port;
};

Process.prototype.openInputPort = function (name) {
  var port = this.inports[name];
  if (port) {
    return port;
  } else {
    console.log('Port ' + this.name + '.' + name + ' not found');
    return null;
  }
};

Process.prototype.openInputPortArray = function (name) {
  var array = getPortArray(this.inports, name);

  if (array.length === 0) {
    console.log('Port ' + this.name + '.' + name + ' not found');
    return null;
  }

  return array;
};

Process.prototype.openOutputPort = function (name, opt) {
  var port = this.outports[name];
  if (port) {
    return port;
  } else {
    if (opt != 'OPTIONAL') {
      console.log('Port ' + this.name + '.' + name + ' not found');
    }
    return null;
  }
};

Process.prototype.openOutputPortArray = function (name) {
  var array = getPortArray(this.outports, name);

  if (array.length === 0) {
    console.log('Port ' + this.name + '.' + name + ' not found');
    return null;
  }

  return array;
};

/**
 * Yield the fiber that is running this process
 *
 * @param preStatus Process status will be set to this before yielding. If not set or set to `null`, the status is not changed
 * @param postStatus Process status will be set to this after yielding. If not set, the status will be changed to ACTIVE
 */
Process.prototype.yield = function (preStatus, postStatus) {
  if (preStatus !== undefined || preStatus !== null) {
    this.status = preStatus;
  }
  if (postStatus === undefined) {
    postStatus = Process.Status.ACTIVE;
  }

  this.yielded = true;

  Fiber.yield();
  if (postStatus !== this.status) {
    this.status = postStatus
  }

  this.yielded = false;
};

new Process();
