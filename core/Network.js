var IIPConnection = require('./IIPConnection'),
  InputPort = require('./InputPort'),
  OutputPort = require('./OutputPort'),
  path = require('path'),
  Process = require('./Process'),
  ProcessConnection = require('./ProcessConnection'),
  parseFBP = require('parsefbp'),
  trace = require('./trace'),
  _ = require('lodash');

var Network = module.exports = function (options) {
  this._processes = {};
  this._connections = [];
  if (options) {
    this.componentRoot = options.componentRoot;
  }
};

/*
 * This function provides support for loading
 * - components that come _with_ this module -> './components/copier.js'
 * - components that are inside a package -> 'package/component'
 * - components that are simply a node module -> 'component'
 * - components that are local to the application trying to load them
 */
function loadComponent(componentName, localRoot) {
  var moduleLocation = componentName;
  var componentField;
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
  }
  trace("Trying to load: " + require.resolve(moduleLocation));
  var component = require(moduleLocation);

  if (componentField) {
    return component[componentField]
  } else {
    return component;
  }
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
  var processes = {};

  Object.keys(graphDefinition.processes).forEach(function (processName) {
    var processDefinition = graphDefinition.processes[processName];
    processes[processName] = network.defProc(processDefinition.component, processName);
  });

  graphDefinition.connections.forEach(function (connection) {
    var target = connection.tgt;
    if ('data' in connection) {
      network.initialize(processes[target.process], getPort(target), connection.data);
    } else {
      var source = connection.src;
      network.connect(processes[source.process], getPort(source), processes[target.process], getPort(target), connection.capacity);
    }

  });
  return network;
};

Network.prototype.getProcessByName = function (processName) {
  return this._processes[processName];
};

Network.prototype.run = function (runtime, options, callback) {
  options = options || {};
  callback = callback || function () {};

  _.invokeMap(this._connections, 'setRuntime', runtime);

  try {
    runtime.run(_.values(this._processes), options, callback);
  } catch (e) {
    console.log('Connections');
    console.log('-----------');
    this._connections.forEach(function (connection) {
      console.log(connection.name + ': ' + connection.pendingIPCount() + '/' + connection.capacity);
    });
    throw e;
  }
};

Network.prototype.defProc = function (func, name) {
  if (typeof func === "string") {
    func = loadComponent(func, this.componentRoot || '');
  }
  if (!func) {
    throw new Error("No function passed to defProc: " + name);
  }

  if (!name) {
    name = func.name;
    if (!name) {
      throw new Error("No name passed to defProc:" + func);
    }
  }

  if (this._processes[name]) {
    throw new Error("Duplicate name specified in defProc:" + func);
  }

  var proc = new Process(name, func);

  proc.trace('defined');

  this._processes[name] = proc;
  return proc;
};

Network.prototype.initialize = function (proc, portName, string) {
  var inport = new InputPort(proc, portName);
  inport.conn = new IIPConnection(string);
};

Network.prototype.connect = function (upproc, upPortName, downproc, downPortName, capacity) {
  if (!capacity) {
    capacity = 10;
  }
  var outport = upproc.outports[upPortName];
  if (outport) {
    console.log('Cannot connect one output port (' + outport.name + ') to multiple input ports');
    return;
  }

  outport = new OutputPort(upproc, upPortName);

  var inport = downproc.inports[downPortName];

  if (inport == null) {
    inport = new InputPort(downproc, downPortName);

    var cnxt = new ProcessConnection(capacity);
    cnxt.name = inport.name;
    this._connections.push(cnxt);
  } else {
    cnxt = inport.conn;
  }

  cnxt.connectProcesses(upproc, outport, downproc, inport);
};

Network.prototype.sinitialize = function (sinport, string) {
  var i = sinport.lastIndexOf('.');
  var procname = sinport.substring(0, i);
  var port = sinport.substring(i + 1);
  var proc = this._processes[procname];

  this.initialize(proc, port, string);
};

Network.prototype.sconnect = function (soutport, sinport, capacity) {

  var i = soutport.lastIndexOf('.');
  var procname = soutport.substring(0, i);
  var upport = soutport.substring(i + 1);
  var upproc = this._processes[procname];
  i = sinport.lastIndexOf('.');
  procname = sinport.substring(0, i);
  var downport = sinport.substring(i + 1);
  var downproc = this._processes[procname];

  this.connect(upproc, upport, downproc, downport, capacity);
};
