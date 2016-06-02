var IIPConnection = require('./IIPConnection')
  , InputPort = require('./InputPort')
  , OutputPort = require('./OutputPort')
  , path = require('path')
  , Process = require('./Process')
  , ProcessConnection = require('./ProcessConnection')
  , parseFBP = require('parsefbp')
  , trace = require('./trace')
  , _ = require('lodash');

var Network = module.exports = function () {
  this._processes = {};
};

/*
 * This function provides support for loading
 * - components that come _with_ this module -> './components/copier.js'
 * - components that are inside a package -> 'package/component'
 * - components that are simply a node module -> 'component'
 */
function loadComponent(componentName) {
  var moduleLocation = componentName;
  var componentField;
  if (componentName.match('^[.]{1,2}/')) {
    moduleLocation = path.resolve(path.join(__dirname, '..', componentName));
  } else if (componentName.indexOf('/') >= 0) {
    moduleLocation = componentName.slice(0, componentName.indexOf('/'));
    componentField = componentName.slice(componentName.indexOf('/') + 1);
    if (moduleLocation === 'jsfbp') {
      moduleLocation = path.resolve(path.join(__dirname, '../components/', componentField + '.js'));
      componentField = undefined;
    }
  }
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

Network.createFromGraph = function (graphString) {
  var graphDefinition = parseFBP(graphString, {caseSensitive: true});

  var network = new Network();
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
      network.connect(processes[source.process], getPort(source), processes[target.process], getPort(target));
    }

  });
  return network;
};

Network.prototype.getProcessByName = function (processName) {
  return this._processes[processName];
};

Network.prototype.run = function (runtime, options, callback) {
  options = options || {};

  _.forEach(this._processes, function (process) {
    _.invokeMap(process.inports, 'setRuntime', runtime);
    _.invokeMap(process.outports, 'setRuntime', runtime);
  });
  runtime.run(_.values(this._processes), options, callback || function () {});
};

Network.prototype.defProc = function (func, name) {
  if (typeof func === "string") {
    func = loadComponent(func);
  }
  if (!func) {
    throw new Error("No function passed to defProc: " + name);
  }
  if (!name) {
    name = func.name;
    if(!name) {
      throw new Error("No name passed to defProc:" + func);
    }
  }

  
  if (this._processes[name]) {
    throw new Error("Duplicate name specified in defProc:" + func);
  }

  var proc = new Process(name, func);

  trace('Created Process with name: ' + name);

  this._processes[name] = proc;
  return proc;
};

Network.prototype.initialize = function (proc, port, string) {
  var inport = new InputPort();
  inport.name = proc.name + "." + port;
  inport.conn = new IIPConnection(string);
  proc.inports[port] = inport;
};

Network.prototype.connect = function (upproc, upport, downproc, downport, capacity) {
  if (capacity == undefined) {
    capacity = 10;
  }
  var outport = upproc.outports[upport];
    if (outport) {
      console.log('Cannot connect one output port (' + outport.name + ') to multiple input ports');
      return;
    }


  outport = new OutputPort();
  outport.name = upproc.name + "." + upport;

  var inportf = null;
  var inport = downproc.inports[downport];

  if (inportf == null) {
    inport = new InputPort();
    inport.name = downproc.name + "." + downport;

    var cnxt = new ProcessConnection(capacity);
    cnxt.name = downproc.name + "." + downport;
    inport.conn = cnxt;
  } else {
    inport = inportf;
    cnxt = inport.conn;
  }

  outport.conn = cnxt;

  upproc.outports[upport] = outport;
  downproc.inports[downport] = inport;
  cnxt.up[cnxt.up.length] = upproc;
  cnxt.down = downproc;
  cnxt.upstreamProcsUnclosed++;
  //console.log(cnxt);
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
