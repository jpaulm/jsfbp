'use strict';


var Fiber = require('fibers'),
  Enum = require('./Enum'),
  IP = require('./IP'),
  IIPConnection = require('./IIPConnection'),
  _ = require('lodash'),
  trace = require('./trace');

var Process = module.exports = function (name, func) {
  this.name = name;
  this.func = func;
  this.fiber = null;
  this.inports = {};
  this.outports = {};
  this._status = Process.Status.NOT_INITIALIZED;
  this.ownedIPs = 0;
  this.cbpending = false;
  this.yielded = false;
  this.result = null; // [data, err]

  this.trace('Created with status: ' + Process.Status.__lookup(this._status), this.name);
  Object.defineProperty(this, 'status', {
    get: function () {
      return this._status;
    },
    set: function (status) {
      if (status === this._status) {
        return;
      }
      this.trace('Transition from ' + Process.Status.__lookup(this._status) + ' to ' + Process.Status.__lookup(status));
      if (status === Process.Status.ACTIVE && _.includes([Process.Status.NOT_INITIALIZED, Process.Status.DORMANT], this._status)) {
        this.trace('Activating component');
      }
      this._status = status;
    }
  })
};

Process.Status = Enum([
  'NOT_INITIALIZED',
  'ACTIVE', // (includes waiting on callback ...)
  'WAITING_TO_RECEIVE',
  'WAITING_TO_FIPE',
  'WAITING_TO_SEND',
  'READY_TO_EXECUTE',
  'DORMANT',
  'CLOSED',
  'DONE'
]);

Process.prototype.IPTypes = IP.Types;

Process.prototype.trace = trace;

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
  return Process.Status.__lookup(this.status);
};

Process.prototype.isSelfStarting = function () {
  var selfstarting = true;
  _.forEach(this.inports, function (inport) {
    selfstarting = selfstarting && (inport.conn instanceof IIPConnection);
  });
  return selfstarting;
};

Process.prototype.createIP = function (data) {
  var ip = new IP(data);
  this.ownedIPs++;
  ip.owner = this;
  this.trace("Normal IP created: " + ip.contents);
  return ip;
};

Process.prototype.createIPBracket = function (bktType, x) {
  if (x == undefined) {
    x = null;
  }
  var ip = new IP(x);
  ip.type = bktType;
  this.ownedIPs++;
  ip.owner = this;
  this.trace("Bracket IP created: " + this.IPTypes.__lookup(ip.type) + ", " + ip.contents);

  return ip;
};

Process.prototype.dropIP = function (ip) {
  var cont = ip.contents;
  if (ip.type != this.IPTypes.NORMAL) {
    cont = this.IPTypes.__lookup(ip.type) + ", " + cont;
  }
  this.trace('IP dropped with: ' + cont);

  if (ip.owner != this) {
    console.log(this.name + ' IP being dropped not owned by this Process: ' + cont);
    return;
  }
  this.ownedIPs--;
  ip.owner = null;
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
  this.trace("Yielding with: " + Process.Status.__lookup(preStatus));
  Fiber.yield();
  if (postStatus !== this.status) {
    this.status = postStatus
  }

  this.yielded = false;
};
