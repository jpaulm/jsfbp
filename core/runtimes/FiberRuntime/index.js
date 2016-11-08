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


/*
 * A general method for queing a process for an upcoming tick
 * Guarantees that processes will not be added to the queue if it is already queued
 */
FiberRuntime.prototype.pushToQueue = function (process) {
  var processInQueue = _.some(this._queue, function (queuedProcess) {
    return queuedProcess.name === process.name;
  });
  if (!processInQueue) {
    trace('Pushing ' + process.name + ' to queue');
    this._queue.push(process);
  }
};

/*
 * A specific method for queuing a process for execution
 */
FiberRuntime.prototype.queueForExecution = function (process) {
  process.status = Process.Status.READY_TO_EXECUTE;
  this.pushToQueue(process);
};

FiberRuntime.prototype._closeProcess = function (proc) {
  proc.trace('closing');
  proc.status = Process.Status.CLOSED;

  this._openProcessCount--;
  _.forEach(proc.outports, function (outPort) {
    var conn = outPort.conn;
    conn.closeFromUpstream();
  });

  _.forEach(proc.inports, function (inport) {
    var conn = inport.conn;
    conn.closeFromDownstream()
  });

  if (proc.ownedIPs != 0) {
    console.log(proc.name + ' closed without disposing of all IPs');
  }
  proc.trace('closed');
};

FiberRuntime.prototype.getCurrentProc = function () {
  return Fiber.current.fbpProc;
};

FiberRuntime.prototype.queueCallback = function (proc, result) {
  proc.trace('Returned from callback');
  if (result != undefined) {
    proc.result = result;
  }
  this.pushToQueue(proc);
};

FiberRuntime.prototype.runAsyncCallback = function (cb) {
  var proc = this.getCurrentProc();
  proc.yielded = true;
  proc.cbpending = true;

  var self = this;
  proc.trace('Yielding to perform callback');

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

    self._actualRun();

    console.log('Elapsed time in millisecs: ' + (Date.now() - startTime));

    callback(null);
  }).run();
};

FiberRuntime.prototype._createFiber = function (process) {
  trace('Creating new fiber for ' + process.name);

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
  return _.filter(this._processList, 'isSelfStarting');
};


var ConnectionState = Enum([
  "UPSTREAM_CLOSED",
  "NO_DATA",
  "DATA_AVAILABLE"
]);

FiberRuntime.prototype.getUpstreamConnectionState = function (proc) {
  var allDrained = true;

  for (var portName in proc.inports) {
    if (!proc.inports.hasOwnProperty(portName)) {
      continue;
    }

    var port = proc.inports[portName];
    var connection = port.conn;
    if (connection instanceof IIPConnection) {
      continue;
    }

    if (connection.hasData()) {
      return ConnectionState.DATA_AVAILABLE
    } else {
      allDrained = allDrained && connection.closed;
    }
  }

  return allDrained ? ConnectionState.UPSTREAM_CLOSED : ConnectionState.NO_DATA;
};

// Fibre running scheduler
FiberRuntime.prototype._actualRun = function () {
  this._queue = this._genInitialQueue();

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
  if (!global.trace) {
    return;
  }
  var queue = this._queue;
  trace("Yield/return: state of future events queue: ");
  trace("--- This Process");
  trace("- " + x.name + " - status: " + x.getStatusString());
  trace("--- Queued Processes");
  _.forEach(queue, function (process) {
    trace("- " + process.name + " - status: " + process.getStatusString());
  });
  if (_.size(this._processList) > _.size(queue)) {
    trace("--- Unqueued Processes");
    _.forEach(_.difference(_.values(this._processList), queue.concat(x)), function (process) {
      trace("- " + process.name + " - status: " + process.getStatusString());
    });
  }
  trace("--- ");
};


FiberRuntime.prototype.activateProcess = function (process) {
  if (process.fiber == null) {
    process = this._createFiber(process);
  } else {
    process.status = Process.Status.ACTIVE;
  }
  return process;
};

FiberRuntime.prototype.deactivateProcess = function (process) {
  process.trace('Deactivating component');
  var connState = this.getUpstreamConnectionState(process);

  if (ConnectionState.UPSTREAM_CLOSED == connState) {
    this._closeProcess(process);
    return true;
  } else if (ConnectionState.NO_DATA == connState) {
    process.status = Process.Status.DORMANT;
    _.forEach(process.inports, function (port) {
      if (port.conn instanceof IIPConnection) {
        port.conn.closed = false;
      }
    });
    return true;
  }
  return false
};

FiberRuntime.prototype._tick = function () {

  var process;

  while ((process = this._queue.shift()) != undefined) {

    if (process.status != Process.Status.DONE) {
      process = this.activateProcess(process);

      this._showQueueState(process);
      var doneWithProcess = false;

      while (!doneWithProcess) {
        var connState = this.getUpstreamConnectionState(process);
        if (process.status === Process.Status.DORMANT && connState === ConnectionState.UPSTREAM_CLOSED) {
          this._closeProcess(process);
          doneWithProcess = true;
        } else if (process.status != Process.Status.CLOSED) {
          if (!process.cbpending) {
            process.status = Process.Status.ACTIVE;

            process.trace('Active Fiber');
            // --------------------------
            process.fiber.run(process.result);
            // ---------------------------
            process.trace('Fiber yielded');
          }

          if (process.yielded) {
            doneWithProcess = true;
          } else if (!process.cbpending) {
            doneWithProcess = this.deactivateProcess(process);
          }
        }
      }
    }
  }
};

function sleep(ms) {
  var fiber = Fiber.current;
  setTimeout(function () {
    fiber.run();
  }, ms);
  Fiber.yield();
}
