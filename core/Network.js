var IIPConnection = require('./IIPConnection')
  , InputPort = require('./InputPort')
  , OutputPort = require('./OutputPort')
  , path = require('path')
  , Process = require('./Process')
  , ProcessConnection = require('./ProcessConnection');

var Network = module.exports = function () {
  this._processes = [];
};

Network.prototype.run = function (runtime, options, callback) {
  options = options || {};
  function setPortRuntime(port) {
    port[1].setRuntime(runtime);
  }

  this._processes.forEach(function (process) {
    process.inports.forEach(setPortRuntime);
    process.outports.forEach(setPortRuntime);
  });
  runtime.run(this._processes, options, callback || function () {
    });
};

var processNames = {};
function generateProcessName(nameTemplate) {
  var reMatch = nameTemplate.match(/(.+)_(X+)/);
  if(reMatch) {
    var nameRoot = reMatch[1];
    var numberPattern = reMatch[2];
    var processNumber = processNames[nameTemplate] || 0;

    processNames[nameTemplate] = processNumber + 1;

    return nameRoot + new Array(numberPattern.length - (processNumber + '').length + 1).join(0) + processNumber;

  } else {
    return nameTemplate;
  }
}

Network.prototype.defProc = function(func, name) {
  if (typeof func === "string") {
    func = require(path.resolve(path.join(__dirname, '..', func)));
  }
  var processName = generateProcessName(name || func.name || 'PROC_XXX');
  var proc = new Process(processName, func);
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
