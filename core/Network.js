var IIPConnection = require('./IIPConnection')
  , InputPort = require('./InputPort')
  , OutputPort = require('./OutputPort')
  , path = require('path')
  , Process = require('./Process')
  , ProcessConnection = require('./ProcessConnection')
  , fbpParser = require('parsefbp');

var Network = module.exports = function () {
  this._processes = [];
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
  if(componentName.startsWith('./')) {
    moduleLocation = path.resolve(path.join(__dirname, '..', componentName));
  } else if(componentName.indexOf('/') >= 0) {
    moduleLocation = componentName.slice(0,componentName.indexOf('/'));
    componentField = componentName.slice(componentName.indexOf('/')+1);
  }
  var component = require(moduleLocation);
  if(componentField) {
    return component[componentField]
  } else {
    return component;
  }
}

Network.createFromGraph = function(graphString) {
  var graphDefinition = fbpParser.parse(graphString, {caseSensitive: true});

  var network = new fbpParser.Network();
  var processes = {};

  graphDefinition.processes.forEach(function(processDefinition, processName) {
    processes[processName] = network.defProc(require(processDefinition.component), processName);
  });

  graphDefinition.connections.forEach(function(connection){
    var target = connection.tgt;
    if(connection.data) {
      network.initialize(processes[target.process], target.port, connection.data);
    } else {
      var source = connection.src;
      network.connect(processes[source.process], source.port, processes[target.process], target.port);
    }

  });
  return network;
};

Network.prototype.run = function(runtime, options, callback) {
  options = options || {};
  function setPortRuntime(port) {
    port[1].setRuntime(runtime);
  }

  this._processes.forEach(function (process) {
    process.inports.forEach(setPortRuntime);
    process.outports.forEach(setPortRuntime);
  });
  runtime.run(this._processes, options, callback || function(){});
};

Network.prototype.defProc = function (func, name) {
  if (typeof func === "string") {
    func = loadComponent(func);
  }
  var proc = new Process(name || func.name, func);
  this._processes.push(proc);
  return proc;
};

Network.prototype.initialize = function (proc, port, string) {
  var inport = new InputPort();
  inport.name = proc.name + "." + port;
  inport.conn = new IIPConnection(string);
  proc.inports[proc.inports.length] = [proc.name + '.' + port, inport];
};

Network.prototype.connect = function (upproc, upport, downproc, downport, capacity) {
  if (capacity == undefined) {
    capacity = 10;
  }
  var outport = null;
  for (var i = 0; i < upproc.outports.length; i++) {
    outport = upproc.outports[i][1];
    if (outport.name == upproc.name + "." + upport) {
      console.log('Cannot connect one output port (' + outport.name + ') to multiple input ports');
      return;
    }
  }

  outport = new OutputPort();
  outport.name = upproc.name + "." + upport;

  var inportf = null;
  var inport = null;
  for (i = 0; i < downproc.inports.length; i++) {
    inport = downproc.inports[i][1];
    if (inport.name == downproc.name + "." + downport) {
      inportf = inport;
      break;
    }
  }
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

  upproc.outports[upproc.outports.length] = [upproc.name + '.' + upport, outport];
  downproc.inports[downproc.inports.length] = [downproc.name + '.' + downport, inport];
  cnxt.up[cnxt.up.length] = upproc;
  cnxt.down = downproc;
  cnxt.upstreamProcsUnclosed++;
  //console.log(cnxt);
};

