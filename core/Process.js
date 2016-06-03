'use strict';


var Fiber = require('fibers')
  , Enum = require('./Enum')
  , IP = require('./IP')
  , trace = require('./trace');

var Process = module.exports = function (name, func) {
  this.name = name;
  this.func = func;
  this.fiber = null;
  this.inports = {};
  this.outports = {};
  this.status = Process.Status.NOT_INITIALIZED;
  this.ownedIPs = 0;
  this.cbpending = false;
  this.yielded = false;
  this.result = null; // [data, err]
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

/*
 * Given a set of ports an a base name XXX, returns all the ports in the set that
 * have the name XXX[<index>]
 */
function getPortArray(ports, name) {
  var re = new RegExp(name + '\\[\\d+\\]');

  return Object.keys(ports)
    .filter(function(portName) {
      return re.test(portName);
    })
    .sort()
    .map(function(portName) {
      return ports[portName];
    });
}


Process.prototype.getStatusString = function () {
  return Process.Status.__lookup(this.status);
};

Process.prototype.createIP = function (data) {
  var ip = new IP(data);
  this.ownedIPs++;
  ip.owner = this;
  trace("Normal IP created: " + ip.contents);
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
  trace("Bracket IP created: " + ["", "OPEN", "CLOSE"][ip.type] + ", " + ip.contents);

  return ip;
};

Process.prototype.dropIP = function (ip) {
  var cont = ip.contents;
  if (ip.type != IP.NORMAL) {
    cont = ["", "OPEN", "CLOSE"][ip.type] + ", " + cont;
  }
  trace('IP dropped with: ' + cont);

  if (ip.owner != this) {
    console.log(this.name + ' IP being dropped not owned by this Process: ' + cont);
    return;
  }
  this.ownedIPs--;
  ip.owner = null;
};

Process.prototype.openInputPort = function (name) {
  var port = this.inports[name];
  if(port) {
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
  if(port) {
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
  if(preStatus !== undefined || preStatus !== null) {
    this.status = preStatus;
  }
  this.yielded = true;
  trace("Yielding with: " + Process.Status.__lookup(preStatus));
  Fiber.yield();
  if(postStatus !== undefined) {
    this.status = postStatus
  } else {
    this.status = Process.Status.ACTIVE;
  }
  this.yielded = false;
};
