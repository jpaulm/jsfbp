'use strict';

var Fiber = require('fibers'),
  IIPConnection = require('../../IIPConnection'),
  Process = require('../../Process'),
  _ = require('lodash'),
  trace = require('../../trace'),
  Enum = require('../../Enum');

Fiber.prototype.fbpProc = null;

var FiberRuntime = module.exports = function () {
  this._queue = [];
  this._openProcessCount = 0;
};


// TOOD Better description of parameter and maybe function name as well
FiberRuntime.prototype.pushToQueue = function (item) {
  this._queue.push(item);
};

FiberRuntime.prototype._closeProcess = function (proc) {
  proc.trace('closing');
  proc.status = Process.Status.CLOSED;

  this._openProcessCount--;
  _.forEach(proc.outports, function (outPort) {
    var conn = outPort.conn;
    if (conn.down.status == Process.Status.WAITING_TO_RECEIVE
      || conn.down.status == Process.Status.NOT_INITIALIZED) {
      conn.down.status = Process.Status.READY_TO_EXECUTE;
      this._queue.push(conn.down);
    }
    conn.upstreamProcsUnclosed--;
    if ((conn.upstreamProcsUnclosed) <= 0) {
      conn.closed = true;
    }
  }.bind(this));

  _.forEach(proc.inports, function (inport) {
    var conn = inport.conn;
    if (conn instanceof IIPConnection) {
      return;
    }
    conn.up.forEach(function (up) {
      if (up.status == Process.Status.CLOSED) {
        up.status = Process.Status.DONE;
        this._queue.push(up);
      }
    }.bind(this));
  }.bind(this));

  if (proc.ownedIPs != 0) {
    console.log(proc.name + ' closed without disposing of all IPs');
  }
  proc.trace('closed');
};

FiberRuntime.prototype.getCurrentProc = function () {
  return Fiber.current.fbpProc;
};

FiberRuntime.prototype.queueCallback = function (proc, result) {
  proc.trace('queueCallback');
  if (result != undefined) {
    proc.result = result;
  }
  this._queue.push(proc);
};

FiberRuntime.prototype.runAsyncCallback = function (cb) {
  var proc = this.getCurrentProc();
  proc.yielded = true;
  proc.cbpending = true;

  var self = this;

  cb(function (result) {
    proc.yielded = false;
    proc.cbpending = false;
    proc.result = result;
    self.queueCallback(proc);
  });

  return Fiber.yield();
};

FiberRuntime.prototype.run = function (processes, options, callback) {
  this._processList = _.keyBy(processes, 'name');
  this._openProcessCount = _.size(this._processList);

  global.trace = global.trace || Boolean(options.trace);

  var self = this;

  Fiber(function () {
    var startTime = new Date();
    var time = startTime.toLocaleString();
    console.log('Start time: ' + time);

    self._actualRun.call(self);

    console.log('Elapsed time in millisecs: ' + (Date.now() - startTime));

    callback(null);
  }).run();
};

FiberRuntime.prototype._createFiber = function (process) {
  trace('creating new fiber for ' + process.name);

  process.fiber = new Fiber(process.func.bind(process, this));
  process.fiber.fbpProc = process;
  process.status = Process.Status.ACTIVE;

  return process;
};

FiberRuntime.prototype._hasDeadLock = function () {
  // We have a deadlock if no processes in the list are ACTIVE or have a callback pending
  return !_.some(this._processList, function (process) {
    return process.cbpending || process.status == Process.Status.ACTIVE
  });
};

FiberRuntime.prototype._genInitialQueue = function () {
  var self = this;
  var queue = [];

  // A process is selfstarting if its incoming ports are only connected to IIPs
  _.forEach(self._processList, function (process) {
    var selfstarting = true;
    _.forEach(process.inports, function (inport) {
      selfstarting = selfstarting && (inport.conn instanceof IIPConnection);
    });

    if (selfstarting) {
      queue.push(process);
    }
  });

  return queue;
};


var ProcState = Enum([
  "UPSTREAM_CLOSED",
  "NO_DATA",
  "DATA_AVAILABLE"
]);
FiberRuntime.prototype._procState = function (proc) {
  var allDrained = true;
  var hasData = false;

  _.forEach(proc.inports, function(port) {
    var connection = port.conn;
    if (connection instanceof IIPConnection) {
      return;
    }

    allDrained = allDrained && connection.usedslots == 0 && connection.closed;
    hasData = hasData || connection.usedslots > 0;
  });

  return  allDrained  ? ProcState.UPSTREAM_CLOSED
    :     !hasData    ? ProcState.NO_DATA
    :                   ProcState.DATA_AVAILABLE;
};

// Fibre running scheduler
FiberRuntime.prototype._actualRun = function () {
  this._queue = this._genInitialQueue();
  var runtime = this;

  _.forEach(this._processList, function (process) {
    _.invokeMap(process.inports, 'setRuntime', runtime);
    _.invokeMap(process.outports, 'setRuntime', runtime);
  });

  while (true) {
    this._tick();

    if (this._openProcessCount <= 0) {
      break;
    }

    if (this._hasDeadLock()) {
      console.log('Deadlock detected');
      _.forEach(this._processList, function (process) {
        console.log('- Process status: ' + process.getStatusString() + ' - ' + process.name);
      });
      throw 'DEADLOCK';
    }
    sleep(50);
  }
};

FiberRuntime.prototype._showQueueState = function (x) {
  var queue = this._queue;
  trace("Yield/return: state of future events queue: ");
  trace("--- This Process");
  trace("- " + x.name + " - status: " + x.getStatusString());
  trace("--- Queue");
  _.forEach(queue, function(process) {
    trace("- " + process.name + " - status: " + process.getStatusString());
  });
  if(_.size(this._processList) > _.size(queue)) {
    trace("--- Other Processes");
    _.forEach(_.difference(_.values(this._processList), queue.concat(x)), function (process) {
      trace("- " + process.name + " - status: " + process.getStatusString());
    });
  }
  trace("--- ");
};


FiberRuntime.prototype._tick = function () {

  var x = this._queue.shift();

  while (x != undefined) {

    if (x.status != Process.Status.DONE) {
      if (x.fiber == null) {
        x = this._createFiber(x);
      } else {
        x.status = Process.Status.ACTIVE;
      }

      this._showQueueState(x);

      while (true) {
        var procState = this._procState(x);
        if (x.status == Process.Status.DORMANT && ProcState.UPSTREAM_CLOSED == procState) {
          this._closeProcess(x);
          break;
        } else if (x.status != Process.Status.CLOSED) {
          if (!x.cbpending) {
            x.status = Process.Status.ACTIVE;

            x.trace('Start process run');
            // --------------------------
            x.fiber.run(x.result);
            // ---------------------------
            x.trace('End process run');

          }
          procState = this._procState(x);
          x.data = null;

          if (x.yielded) {
            break;
          } else if (!x.cbpending) {

            if (ProcState.UPSTREAM_CLOSED == procState) {
              this._closeProcess(x);
              break;
            } else if (ProcState.NO_DATA == procState) {
              x.status = Process.Status.DORMANT;
              _.forEach(x.inports, function (port) {
                if (port.conn instanceof IIPConnection) {
                  port.conn.closed = false;
                }
              });
              break;
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
  setTimeout(function () {
    fiber.run();
  }, ms);
  Fiber.yield();
}
