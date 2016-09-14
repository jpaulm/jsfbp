'use strict';


var IP = require('./IP');

var Component = module.exports = function (process) {
  this.process = process;
};

Component.prototype.IPTypes = IP.Types;

function getPort(ports, name, opt) {
  var port = ports[name];
  if (port) {
    return port;
  } else {
    if (opt != 'OPTIONAL') {
      console.log('Connection ' + this.name + '.' + name + ' not found');
    }
    return null;
  }
}

/*
 * Given a set of ports an a base name XXX, returns all the ports in the set that
 * have the name XXX[<index>]
 */
function getPortArray(ports, name) {
  var re = new RegExp(name + '\\[\\d+\\]');

  var portArray =  Object.keys(ports)
    .filter(function (portName) {
      return re.test(portName);
    })
    .sort()
    .map(function (portName) {
      return ports[portName];
    });

  if (portArray.length === 0) {
    console.log('Connection ' + this.name + '.' + name + ' not found');
    return null;
  } else {
    return portArray;
  }
}



Component.prototype.openInputPort = function (name) {
  return getPort(this.process.inports, name, false);
};

Component.prototype.openInputPortArray = function (name) {
  return getPortArray(this.process.inports, name);
};

Component.prototype.openOutputPort = function (name, opt) {
  return getPort(this.process.outports, name, opt);
};

Component.prototype.openOutputPortArray = function (name) {
  return getPortArray(this.process.outports, name);
};

