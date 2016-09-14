var path = require('path'),
  parseFBP = require('parsefbp'),
  _ = require('lodash'),
  fork = require('child_process').fork,
  Promise = require('bluebird');



/*
 _connections Definition for process P with inports I,J and outport O
 Remote processes are R and S
 IIP into P.J

 R.O -> P.I
 P.O -> S.I
 'foo' -> P.J

 {
  R: {
    out: { O: { process: 'P', port: 'I', capacity: 20 } },
    in :{}
  },
  P: {
    out: { O: { process: 'S', port: 'I' } },
    in: { I: [ { process: 'R', port: 'O' } ], J: [ { data: 'foo' } ] }
  },
  S: {
    out: {},
    in: { I: [ { process: 'P', port: 'O' } ] }
  }
 }
 */

var Network = module.exports = function (options) {
  this._processes = {};

  this._connections = {};
  if (options) {
    this.componentRoot = options.componentRoot;
  }
};

function locateComponent(componentName, localRoot) {
  var componentField;
  var moduleLocation;

  if (componentName.match('^[.]{1,2}/')) {
    moduleLocation = path.resolve(path.join(__dirname, '..', componentName));
  } else if (componentName.indexOf('/') >= 0) {
    moduleLocation = componentName.slice(0, componentName.indexOf('/'));
    componentField = componentName.slice(componentName.indexOf('/') + 1);
    if (moduleLocation === 'jsfbp') {
      moduleLocation = path.resolve(path.join(__dirname, '..', 'components', componentField + '.js'));
      componentField = undefined;
    } else if (moduleLocation === '') {
      moduleLocation = path.join(localRoot, componentField);
      componentField = undefined;
    }
  } else {
    moduleLocation = componentName;
  }
  return {moduleLocation: moduleLocation, componentField: componentField};
}

function getPort(connectionEnd) {
  var port = connectionEnd.port;
  if ('index' in connectionEnd) {
    port += '[' + connectionEnd.index + ']';
  }
  return port;
}

Network.createFromGraph = function (graphString, localRoot) {
  var graphDefinition = parseFBP(graphString, {
    caseSensitive: true
  });

  var network = new Network({
    componentRoot: localRoot
  });

  _.forEach(graphDefinition.processes, function (processDefinition, processName) {
    network.defineProcess(processDefinition.component, processName);
  });

  graphDefinition.connections.forEach(function (connection) {
    var target = connection.tgt;
    if ('data' in connection) {
      network.initialize(target.process, getPort(target), connection.data);
    } else {
      var source = connection.src;
      network.connect(source.process, getPort(source), target.process, getPort(target), connection.capacity);
    }
  });

  return network;
};

/**
 * Given a `processName`, this returns an object that describes the connections to and from the process
 * @param {string} processName
 * @returns {*}
 */
Network.prototype.getProcessConnections = function (processName) {
  if(typeof processName !== "string") {
    throw new Error("Non-string passed to getProcessConnections. Did you pass a process instead of its name?");
  }
  if (!this._connections[processName]) {
    this._connections[processName] = {out: {}, in: {}}
  }

  return this._connections[processName];
};


function attachInputToProcess(network, processName, portName, input) {
  var processConnections = network.getProcessConnections(processName);

  if (!processConnections.in[portName]) {
    processConnections.in[portName] = [];
  }

  processConnections.in[portName].push(input);

}

Network.prototype.initialize = function (process, portName, string) {
  var processName = (typeof process === "string") ? process : process.name;
  attachInputToProcess(this, processName, portName, {data: string});
};

Network.prototype.defineProcess = function (moduleName, name) {
  if (!name) {
    throw new Error("No name passed to defineProcess:" + moduleName);
  } else if (this._processes[name]) {
    throw new Error("Duplicate name specified in defineProcess:" + moduleName);
  } else {
    var moduleLocation = locateComponent(moduleName, this.componentRoot || '');
    this._processes[name] = {
      name: name,
      location: moduleLocation
    };
    return this._processes[name];
  }
};

Network.prototype.getProcessByName = function (processName) {
  return this._processes[processName];
};

Network.prototype.getProcessList = function () {
  return _.keys(this._processes);
};

Network.prototype.getProcessPorts = function (processName) {
  var connections = this.getProcessConnections(processName);
  return {
    in: _.keys(connections.in),
    out: _.keys(connections.out)
  }
};

Network.prototype.connect = function (upstreamProcess, upstreamPortName, downstreamProcess, downstreamPortName, capacity) {
  var upstreamProcessName = (typeof upstreamProcess === 'string') ? upstreamProcess : upstreamProcess.name;
  var downstreamProcessName = (typeof downstreamProcess === "string") ? downstreamProcess : downstreamProcess.name;
  attachInputToProcess(this, downstreamProcessName, downstreamPortName, {process: upstreamProcessName, port: upstreamPortName});

  var upstreamConnections = this.getProcessConnections(upstreamProcessName);
  var processOutPorts = upstreamConnections.out;
  if (processOutPorts[upstreamPortName]) {
    console.log('Cannot connect one output port (' + upstreamProcess + '.' + upstreamPortName + ') to multiple input ports');
    return;
  }


  processOutPorts[upstreamPortName] = {process: downstreamProcessName, port: downstreamPortName, capacity: capacity || 10};
};

function getPortInfo(sinport) {
  var i = sinport.lastIndexOf('.');
  var procname = sinport.substring(0, i);
  var port = sinport.substring(i + 1);
  var proc = this._processes[procname];
  return {port: port, proc: proc};
}

Network.prototype.sinitialize = function (sinport, string) {
  var other = getPortInfo.call(this, sinport);

  this.initialize(other.proc, other.port, string);
};

Network.prototype.sconnect = function (soutport, sinport, capacity) {
  var up = getPortInfo.call(this, soutport);
  var down = getPortInfo.call(this, sinport);

  this.connect(up.proc, up.port, down.proc, down.port, capacity);
};

function determineTarget(message, network) {
  var connections = network.getProcessConnections(message.from.process);
  if(!connections) {
    throw new Error("No connections found for process: " + message.from.process);
  }
  return connections.out[message.from.portName];
}

function routeMessageThroughNetwork(message, network) {
  if(!network._processes[message.from.process]) {
    throw new Error(message.from.process + " is not part of this Network");
  } else {
    var target = determineTarget(message, network);
    if(!target) {
      throw new Error("No connection exists for " + message.from.process + "." + message.from.portName);
    }
    message.to = {
      process: target.process,
      portName: target.port
    };
  }
}

function sendMessage(message, network) {
  var targetProcess = network.getProcessByName(message.to.process);
  sendMessageToProcess(message, targetProcess);
}

function sendMessageToProcess(message, process) {
  process.details.child.send(message);
}

Network.prototype.run = function (options, callback) {
  options = options || {};
  callback = callback || function () {};

  var networkProcesses = this._processes;
  var network = this;

  var processPromises = _.map(networkProcesses, function (details, processName) {
    details.child = fork('core/Process.js');

    details.child.send('initialize', {
      componentLocation: details.location,
      name: processName,
      ports: this.getProcessPorts(processName)
    });

    var processPromise = new Promise();


    details.child.on('message', function (message) {
      if(message.type === "initializationComplete") {
        processPromise.resolve(processName);
        details.state = "INITIALIZED";
        details.child.send({ type: 'startWhenReady' });

      } else if (message.type === "stateChange") {
        if(details.state !== message.oldState) {
          throw new Error("Invalid state change for " + processName +
            "; currentState: " + details.state + ", expectedState: " +message.oldState);
        }
        details.state = message.newState;

      } else {
        routeMessageThroughNetwork(message, network);
        sendMessage(message, network);
      }
    });

    return processPromise;
  });

  Promise.all(processPromises)
    .then(_.partial(callback, null))
    .catch(callback);
};
