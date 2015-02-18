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
  
  this._tracing = global.tracing = Boolean(options.trace);
  
  var self = this;
  Fiber(function() {
    self._actualRun.call(self, options.trace);
    callback(null);
  }).run();
};

// Fibre running scheduler
FiberRuntime.prototype._actualRun = function (trace) {
  var d = new Date();
  var st = d.getTime();
  console.log('Start time: ' + d.toISOString());

  this._tracing = Boolean(trace);

  this._count = this._list.length;

  for (var i = 0; i < this._list.length; i++) {
    var selfstarting = true;
    for (var j = 0; j < this._list[i].inports.length; j++) {
      var k = this._list[i].inports[j];
      if (!k[1].conn instanceof IIPConnection) {
        selfstarting = false;
      }
    }

    if (selfstarting) {
      this._queue.push(this._list[i]);
    }
  }

  while (true) {
    var x = this._queue.shift();
    while (x != undefined) {      
      if (x.fiber == null) {
        if (this._tracing)
           console.log('creating new fiber for ' + x.name);
        x.fiber = new Fiber(x.func.bind(null, this));
        x.fiber.fbpProc = x;
        x.status = Process.Status.ACTIVE;
      }

      if (x.status != Process.Status.CLOSED) {
        if (x.status == Process.Status.DORMANT && upconnsclosed(x)) {
          this._close(x);
        }
        else {
          if (this._tracing) {
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
          x.fiber.run(x.result);
          //------------------

          x.data = null;
          if (this._tracing) {
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
              this._queue.push(x);
              for (var j = 0; j < x.inports.length; j++) {
                var k = x.inports[j];
                if (k[1].conn instanceof IIPConnection) {
                  k[1].conn.closed = false;
                }
              }
            }
            else {
              this._close(x);
            }
          }
        }
      }
      x = this._queue.shift();
    }

    if (this._count <= 0) {
      break;
    }
    var deadlock = true;
    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].cbpending || this._list[i].status == Process.Status.ACTIVE) {
        deadlock = false;
        break;
      }
    }
    if (deadlock) {
      console.log('Deadlock detected');
      for (var i = 0; i < this._list.length; i++) {
        console.log('- Process status: ' + this._list[i].getStatusString() + ' - ' + this._list[i].name);
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