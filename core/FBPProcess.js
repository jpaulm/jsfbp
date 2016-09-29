'use strict';


var Fiber = require('fibers'),
  Enum = require('./Enum'),
  IP = require('./IP'),
  InputPort = require('./InputPort'),
  OutputPort = require('./OutputPort');

var FBPProcess = module.exports = function () {
  this.inports = {};
  this.outports = {};
  this._status = FBPProcess.Status.NOT_INITIALIZED;
  this.ownedIPs = 0;
  console.log("FBPProcess created\n");

  process.once('message', function (message) {
    if (message.type !== "INITIALIZE") {
      throw new Error("Uninitialized FBPProcess received message that wasn't 'INITIALIZE'");
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
        process.send('message', {
          type: "IP_REQUESTED",
          details: {
            process: process.name,
            port: e.portName
          }
        });
        process.setStatus(FBPProcess.Status.WAITING_TO_RECEIVE);

        process.once('message', function (message) {
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
        process.send('message', {
          type: "IP_AVAILABLE",
          details: {
            process: process.name,
            port: e.portName,
            ip: e.ip
          }
        });
        process.once('message', function (message) {
          if (message.type === 'IP_ACCEPTED') {
            process.setStatus(FBPProcess.Status.ACTIVE);
            Fiber.current.run();
          }
        });
        process.setStatus(FBPProcess.Status.WAITING_TO_SEND);
      });
      return outputPort;
    });
    this.selfStarting = details.selfStarting;
    this.name = details.name;

    console.log("FBPProcess initialized: " + this);
    this.setStatus(FBPProcess.Status.INITIALIZED);
  }.bind(this))

};

FBPProcess.Status = Enum([
  'NOT_INITIALIZED',
  'INITIALIZED',
  'ACTIVE',
  'WAITING_TO_RECEIVE',
  'WAITING_TO_SEND',
  'DORMANT',
  'CLOSED',
  'DONE'
]);

FBPProcess.prototype.setStatus = function (newStatus) {
  var oldStatus = this._status;
  this._status = newStatus;

  process.send({
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

FBPProcess.prototype.IPTypes = IP.Types;

FBPProcess.prototype.toString = function () {
  return "FBPProcess: { \n" +
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
function getPortArray(ports, processName, portName) {
  var re = new RegExp(portName + '\\[\\d+\\]');

  var portArray = Object.keys(ports)
    .filter(function (portName) {
      return re.test(portName);
    })
    .sort()
    .map(function (portName) {
      return ports[portName];
    });

  if (portArray.length === 0) {
    console.log('Port ' + processName + '.' + portName + ' not found');
    return null;
  }

  return portArray;
}

FBPProcess.prototype.getStatusString = function () {
  return FBPProcess.Status.__lookup(this._status);
};

FBPProcess.prototype.isSelfStarting = function () {
  return this.selfStarting;
};

FBPProcess.prototype.createIP = function (data) {
  var ip = new IP(data);
  this.ownedIPs++;
  ip.owner = this;
  return ip;
};

FBPProcess.prototype.createIPBracket = function (bktType, x) {
  if (x == undefined) {
    x = null;
  }
  var ip = this.createIP(x);
  ip.type = bktType;

  return ip;
};

FBPProcess.prototype.disownIP = function (ip) {
  if (ip.owner != this) {
    throw new Error(this.name + ' IP being disowned is not owned by this FBPProcess: ' + ip);
  }
  this.ownedIPs--;
  ip.owner = null;
};

FBPProcess.prototype.dropIP = function (ip) {
  var cont = ip.contents;
  if (ip.type != this.IPTypes.NORMAL) {
    cont = this.IPTypes.__lookup(ip.type) + ", " + cont;
  }

  this.disownIP(ip);
};

FBPProcess.prototype.addInputPort = function (port) {
  this.inports[port.portName] = port;
};
FBPProcess.prototype.addOutputPort = function (port) {
  this.outports[port.portName] = port;
};

FBPProcess.prototype.openInputPort = function (name) {
  var port = this.inports[name];
  if (port) {
    return port;
  } else {
    console.log('Port ' + this.name + '.' + name + ' not found');
    return null;
  }
};

FBPProcess.prototype.openInputPortArray = function (name) {
  return getPortArray(this.inports, this.name, name);
};

FBPProcess.prototype.openOutputPort = function (name, opt) {
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

FBPProcess.prototype.openOutputPortArray = function (name) {
  return getPortArray(this.outports, this.name, name);
};

/**
 * Yield the fiber that is running this process
 *
 * @param preStatus FBPProcess status will be set to this before yielding. If not set or set to `null`, the status is not changed
 * @param postStatus FBPProcess status will be set to this after yielding. If not set, the status will be changed to ACTIVE
 */
FBPProcess.prototype.yield = function (preStatus, postStatus) {
  if (preStatus !== undefined || preStatus !== null) {
    this.status = preStatus;
  }
  if (postStatus === undefined) {
    postStatus = FBPProcess.Status.ACTIVE;
  }

  this.yielded = true;

  Fiber.yield();
  if (postStatus !== this.status) {
    this.status = postStatus
  }

  this.yielded = false;
};

new FBPProcess();
