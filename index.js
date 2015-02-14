'use strict';

var Fiber = require('fibers')
  , IP = require('./core/IP')
  , Process = require('./core/Process')
  , ProcessConnection = require('./core/ProcessConnection')
  , IIPConnection = require('./core/IIPConnection')
  , InputPort = require('./core/InputPort')
  , InputPortArray = require('./core/InputPortArray')
  , OutputPort = require('./core/OutputPort')
  , OutputPortArray = require('./core/OutputPortArray')
  , Utils = require('./core/utils.js');

Fiber.prototype.fbpProc = null;

// --- classes and functions ---

module.exports.defProc = function(func, name) {
  if (typeof func === "string") {
    func = require(func);
  }
  return new Process(name || func.name, func, list);
};

var list = []; // list of processes
var queue = []; // list of processes ready to continue

global.tracing = false;
//var currentproc;
var count;

function close(proc) {
  if (tracing) {
    console.log(proc.name + ' closing');
  }
  proc.status = Process.Status.CLOSED;
  //console.log('cl' + count);
  count--;
  for (var i = 0; i < proc.outports.length; i++) {
    var conn = proc.outports[i][1].conn;
    if (conn.down.status == Process.Status.WAITING_TO_RECEIVE ||
        conn.down.status == Process.Status.NOT_INITIALIZED) {
      conn.down.status = Process.Status.READY_TO_EXECUTE;
      queue.push(conn.down);
    }
    conn.upstreamProcsUnclosed--;
    if ((conn.upstreamProcsUnclosed) <= 0) {
      conn.closed = true;
    }
  }

  for (var i = 0; i < proc.inports.length; i++) {
    var conn = proc.inports[i][1].conn;
    if (conn instanceof IIPConnection) {
      continue;
    }
    for (var j = 0; j < conn.up.length; j++) {
      if (conn.up[j].status == Process.Status.CLOSED) {
        queue.push(conn.up[j]);
      }
    }
  }
  if (proc.ownedIPs != 0) {
    console.log(proc.name + ' closed without disposing of all IPs');
  }
  if (tracing) {
    console.log(proc.name + ' closed');
  }
}

module.exports.getCurrentProc = function() {
  return Fiber.current.fbpProc;
};

module.exports.queueCallback = function(proc, data) {
  if (tracing) {
    console.log('queue ' + proc.name);
  }
  if (data != undefined) {
    proc.data = data;
  }
  queue.push(proc);
};

module.exports.setCallbackPending = function(b) {
  Fiber.current.fbpProc.cbpending = b;
};

module.exports.initialize = function(proc, port, string) {
  var inport = new InputPort(queue);
  inport.name = proc.name + "." + port;
  inport.conn = new IIPConnection(string);
  proc.inports[proc.inports.length] = [proc.name + '.' + port, inport];
};

exports.connect = function(upproc, upport, downproc, downport, capacity) {
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

  outport = new OutputPort(queue);
  outport.name = upproc.name + "." + upport;

  var inportf = null;
  var inport = null;
  for (var i = 0; i < downproc.inports.length; i++) {
    inport = downproc.inports[i][1];
    if (inport.name == downproc.name + "." + downport) {
      inportf = inport;
      break;
    }
  }
  if (inportf == null) {
    inport = new InputPort(queue);
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

function run(options) {
  options = options || {};
  Fiber(function() {
    run2(options.trace);
  }).run();
}

module.exports.run = run;

// Fibre running scheduler

function run2(trace) {
  var d = new Date();
  var st = d.getTime();
  console.log('Start time: ' + d.toISOString());

  tracing = trace;

  count = list.length;

  for (var i = 0; i < list.length; i++) {
    var selfstarting = true;
    for (var j = 0; j < list[i].inports.length; j++) {
      var k = list[i].inports[j];
      if (!k[1].conn instanceof IIPConnection) {
        selfstarting = false;
      }
    }

    if (selfstarting) {
      queue.push(list[i]);
    }
  }

  while (true) {
    var x = queue.shift();
    while (x != undefined) {      
      if (x.fiber == null) {
        if (tracing)
           console.log('creating new fiber for ' + x.name);
        x.fiber = new Fiber(x.func);
        x.fiber.fbpProc = x;
        x.status = Process.Status.ACTIVE;
      }

      if (x.status != Process.Status.CLOSED) {
        if (x.status == Process.Status.DORMANT && upconnsclosed(x)) {
          close(x);
        }
        else {
          if (tracing) {
            if (x.yielded) {
              console.log(x.name + ' fiber resumed');
            }
            else {
              if (x.cbpending) {
                console.log(x.name + ' fiber callback run');
              }
              else {
                console.log(x.name + ' fiber started');
              }
            }
          }

          //------------------    
          x.fiber.run(x.data);
          //------------------

          x.data = null;
          if (tracing) {
            console.log(x.name + ' yielded: ' + x.yielded + ', cbpending: ' + x.cbpending);
            if (x.yielded) {
              console.log(x.name + ' fiber yielded');
            }
            else {
              if (x.cbpending) {
                console.log(x.name + ' fiber awaiting callback');
              }
              else {
                console.log(x.name + ' fiber ended');
              }
            }
          }
          if (!x.yielded && !x.cbpending) {
            if (!upconnsclosed(x)) {
              x.status = Process.Status.DORMANT;
              queue.push(x);
              for (var j = 0; j < x.inports.length; j++) {
                var k = x.inports[j];
                if (k[1].conn instanceof IIPConnection) {
                  k[1].conn.closed = false;
                }
              }
            }
            else {
              close(x);
            }
          }
        }
      }
      x = queue.shift();
    }

    if (count <= 0) {
      break;
    }
    var deadlock = true;
    for (var i = 0; i < list.length; i++) {
      if (list[i].cbpending || list[i].status == Process.Status.ACTIVE) {
        deadlock = false;
        break;
      }
    }
    if (deadlock) {
      console.log('Deadlock detected');
      for (var i = 0; i < list.length; i++) {
        console.log('- Process status: ' + Process.statusString(list[i].status) + ' - ' + list[i].name);
      }
      throw '';
    }
    sleep(100);
  }

  d = new Date();
  var et = d.getTime();
  et -= st;
  et /= 1000;
  console.log('Elapsed time in secs: ' + et.toFixed(3));
}

function upconnsclosed(proc) {
  for (var j = 0; j < proc.inports.length; j++) {
    var k = proc.inports[j];
    if (k[1].conn instanceof IIPConnection) {
      continue;
    }
    if (!(k[1].conn.closed) || k[1].conn.usedslots > 0) {
      return false;
    }
  }
  return true;
}

function sleep(ms) {
  var fiber = Fiber.current;
  setTimeout(function() {
    fiber.run();
  }, ms);
  Fiber.yield();
}