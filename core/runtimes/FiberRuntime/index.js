'use strict';

var Fiber = require('fibers')
  , IIPConnection = require('../../IIPConnection')
  , Process = require('../../Process')

Fiber.prototype.fbpProc = null;

var FiberRuntime = module.exports = function() {
  this._queue = [];
  this._count = null;
  this._tracing = false;
};

FiberRuntime.prototype.isTracing = function() {
  return this._tracing;
};

// TOOD Better description of parameter and maybe function name as well
FiberRuntime.prototype.pushToQueue = function(item) {
  this._queue.push(item);
};

FiberRuntime.prototype._close = function(proc) {
  if (this._tracing) {
    console.log(proc.name + ' closing');
  }
  proc.status = Process.Status.CLOSED;
  //console.log('cl' + count);
  this._count--;
  for (var i = 0; i < proc.outports.length; i++) {
    var conn = proc.outports[i][1].conn;
    if (conn.down.status == Process.Status.WAITING_TO_RECEIVE ||
        conn.down.status == Process.Status.NOT_INITIALIZED) {
      conn.down.status = Process.Status.READY_TO_EXECUTE;
      this._queue.push(conn.down);
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
        this._queue.push(conn.up[j]);
      }
    }
  }
  if (proc.ownedIPs != 0) {
    console.log(proc.name + ' closed without disposing of all IPs');
  }
  if (this._tracing) {
    console.log(proc.name + ' closed');
  }
}

FiberRuntime.prototype.getCurrentProc = function() {
  return Fiber.current.fbpProc;
};

FiberRuntime.prototype.queueCallback = function(proc, result) {
  if (this._tracing) {
    console.log('queue ' + proc.name);
  }
  if (result != undefined) {
    proc.result = result;
  }
  this._queue.push(proc);
};

FiberRuntime.prototype.setCallbackPending = function(b) {
  Fiber.current.fbpProc.cbpending = b;
};

FiberRuntime.prototype.run = function (processes, options, callback) {
  this._list = processes;
  this._count = this._list.length;
  
  this._tracing = global.tracing = Boolean(options.trace);
  
  var self = this;

  Fiber(function() {
    var startTime = Date.now();
    console.log('Start time: ' + startTime);
    
    self._actualRun.call(self);

    console.log('Elapsed time in secs: ' + (Date.now() - startTime));
    
    callback(null);
  }).run();
};

FiberRuntime.prototype._createFiber = function (process) {
  if (this._tracing) {
    console.log('creating new fiber for ' + process.name);
  }
  process.fiber = new Fiber(process.func.bind(null, this));
  process.fiber.fbpProc = process;
  process.status = Process.Status.ACTIVE;
  
  return process;
};

FiberRuntime.prototype._hasDeadLock = function () {
  for (var i = 0; i < this._list.length; i++) {
    if (this._list[i].cbpending || this._list[i].status == Process.Status.ACTIVE) {
      return false;
    }
  }
  return true;
};

FiberRuntime.prototype._genInitialQueue = function () {
  var self = this;
  this._queue = [];
  
  this._list.forEach(function (process) {
    var shallAdd = process.inports.every(function (inport) {
      return !(inport[1].conn instanceof IIPConnection);
    });
    
    if (shallAdd || true) {
      self._queue.push(process);
    }
  });
  return this._queue;
};

FiberRuntime.prototype._logProcessInfo = function (proc) {
  if (this._tracing) {
    console.log({name: proc.name, yielded: proc.yielded, cbpending: proc.cbpending});
  }
};

FiberRuntime.prototype._areUpConnsClosed = function (proc) {
  return proc.inports.every(function (inport) {
    if (inport[1].conn instanceof IIPConnection) {
      return true;
    }
    else if (!(inport[1].conn.closed) || inport[1].conn.usedslots > 0) {
      return false;
    }
    else {
      return true;
    }
  });
};

// Fibre running scheduler
FiberRuntime.prototype._actualRun = function (trace) {
  this._queue = this._genInitialQueue();
  
  while (true) {
    this._tick();

    if (this._count <= 0) {
      break;
    }
    
    if (this._hasDeadLock()) {
      console.log('Deadlock detected');
      for (var i = 0; i < this._list.length; i++) {
        console.log('- Process status: ' + this._list[i].getStatusString() + ' - ' + this._list[i].name);
      }
      throw 'DEADLOCK';
    }
    sleep(100);
  }
};

FiberRuntime.prototype._tick = function () {
  var x = this._queue.shift();
  while (x != undefined) {      
    if (x.fiber == null) {
      x = this._createFiber(x);
    }
    
    if (x.status == Process.Status.DORMANT && this._areUpConnsClosed(x)) {
      this._close(x);
    }
    else if (x.status != Process.Status.CLOSED) {        
      x.fiber.run(x.result);
      x.data = null;
      
      if (!x.yielded && !x.cbpending) {
        if (this._areUpConnsClosed(x)) {
          this._close(x);
        }
        else {
          x.status = Process.Status.DORMANT;
          this._queue.push(x);
          for (var i = 0; i < x.inports.length; i++) {
            var inport = x.inports[i];
            if (inport[1].conn instanceof IIPConnection) {
              inport[1].conn.closed = false;
            }
          }
        }
      }
    }
    x = this._queue.shift();
  }
};

function sleep(ms) {
  var fiber = Fiber.current;
  setTimeout(function() {
    fiber.run();
  }, ms);
  Fiber.yield();
}