var path = require('path'),
  parseFBP = require('parsefbp'),
  _ = require('lodash'),
  ProcessContainer = require('./ProcessContainer'),
  NetworkRouter = require('./NetworkRouter');

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
  return {
    moduleLocation: moduleLocation,
    componentField: componentField
  };
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
  if (typeof processName !== "string") {
    throw new Error("Non-string passed to getProcessConnections. Did you pass a process instead of its name?");
  }
  if (!this._connections[processName]) {
    this._connections[processName] = {
      out: {},
      in: {}
    }
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
  attachInputToProcess(this, processName, portName, {
    data: string
  });
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

Network.prototype.getProcessPortNames = function (processName) {
  var connections = this.getProcessConnections(processName);
  return { in: _.keys(connections.in),
    out: _.keys(connections.out)
  }
};

Network.prototype.connect = function (upstreamProcess, upstreamPortName, downstreamProcess, downstreamPortName, capacity) {
  var upstreamProcessName = (typeof upstreamProcess === 'string') ? upstreamProcess : upstreamProcess.name;
  var downstreamProcessName = (typeof downstreamProcess === "string") ? downstreamProcess : downstreamProcess.name;
  attachInputToProcess(this, downstreamProcessName, downstreamPortName, {
    process: upstreamProcessName,
    port: upstreamPortName
  });

  var upstreamConnections = this.getProcessConnections(upstreamProcessName);
  var processOutPorts = upstreamConnections.out;
  if (processOutPorts[upstreamPortName]) {
    console.log('Cannot connect one output port (' + upstreamProcess + '.' + upstreamPortName + ') to multiple input ports');
    return;
  }

  processOutPorts[upstreamPortName] = {
    process: downstreamProcessName,
    port: downstreamPortName,
    capacity: capacity || 10
  };
};

function getPortInfo(sinport) {
  var i = sinport.lastIndexOf('.');
  var procname = sinport.substring(0, i);
  var port = sinport.substring(i + 1);
  var proc = this._processes[procname];
  return {
    port: port,
    proc: proc
  };
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

Network.prototype.processIsSelfStarting = function (processName) {
  var connections = this.getProcessConnections(processName);
  var inputs = connections.in;
  return _.some(inputs, function (inputDetails) {
    return 'data' in inputDetails[0];
  })
};

Network.prototype.run = function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  callback = callback || function () {};

  var networkProcesses = this._processes;
  var network = this;


  var updates = 0;

  this.router = new NetworkRouter(this._connections);
  this.processContainers = _.map(networkProcesses, function (details, processName) {
    var ports = network.getProcessPortNames(processName);
    var connections = network.getProcessConnections(processName);
    console.log(connections);
    var container = new ProcessContainer({
        name: processName,
        component: details.location,
        in: ports.in,
        out: ports.out,
        capacities: _.reduce(connections.out, function (capacities, connection, portName) {
          capacities[portName] = connection.capacity;
          return capacities;
        }, {}),
        selfStarting: network.processIsSelfStarting(processName)
      },
      callback
    );
    container.on('statusChange', function (e) {
      console.log(e);
      updates++;
      if (updates >= 4) {
        callback();
      }
    });
    return container;
  });


};
