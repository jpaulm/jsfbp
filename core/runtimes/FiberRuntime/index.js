'use strict';

var Fiber = require('fibers')
  , IIPConnection = require('../../IIPConnection')
  , Process = require('../../Process')
  , trace = require('../../trace');

Fiber.prototype.fbpProc = null;

var FiberRuntime = module.exports = function () {
  this._queue = [];
  this._count = null;
};


// TOOD Better description of parameter and maybe function name as well
FiberRuntime.prototype.pushToQueue = function (item) {
  this._queue.push(item);
};

FiberRuntime.prototype._close = function (proc) {
  trace('closing');
  proc.status = Process.Status.CLOSED;
  // console.log('cl' + count);
  this._count--;
  proc.outports.forEach(function(outPort) {
    var conn = outPort[1].conn;
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

  proc.inports.forEach(function(inport) {
    var conn = inport[1].conn;
    if (conn instanceof IIPConnection) {
      return;
    }
    conn.up.forEach(function(up) {
      if (up.status == Process.Status.CLOSED) {
        up.status = Process.Status.DONE;
        this._queue.push(up);
      }
    }.bind(this));
  }.bind(this));

  if (proc.ownedIPs != 0) {
    console.log(proc.name + ' closed without disposing of all IPs');
  }
  trace('closed');
};

FiberRuntime.prototype.getCurrentProc = function () {
  return Fiber.current.fbpProc;
};

FiberRuntime.prototype.queueCallback = function (proc, result) {
  trace('queue');
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
  this._list = processes;
  this._count = this._list.length;

  global.trace = Boolean(options.trace);

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
  //console.log("Deadlock test");
  for (var i = 0; i < this._list.length; i++) {
    //console.log("d- " + this._list[i].name + " - status: "
    //		+ this._list[i].getStatusString());
    if (this._list[i].cbpending
      || this._list[i].status == Process.Status.ACTIVE) {
      return false;
    }
  }
  return true;
};

FiberRuntime.prototype._genInitialQueue = function () {
  var self = this;
  var queue = [];

  // A process is selfstarting if its incoming ports are only connected to IIPs
  self._list.forEach(function(process) {
    var selfstarting = process.inports.reduce(function(currentlySelfstarting, inport) {
      return currentlySelfstarting && (inport[1].conn instanceof IIPConnection);
    }, true);

    if(selfstarting) {
      queue.push(process);
    }
  });

  return queue;
};


FiberRuntime.prototype._procState = function (proc) {
  // return 2 if all upstream processes closed down, 1 if no data in
  // connections, 0 otherwise
  var hasData = false;
  var allDrained = true;
  for (var i = 0; i < proc.inports.length; i++) {
    if (proc.inports[i][1].conn instanceof IIPConnection)
      continue;
    allDrained = allDrained && proc.inports[i][1].conn.usedslots == 0
      && proc.inports[i][1].conn.closed;
    hasData = hasData || proc.inports[i][1].conn.usedslots > 0;
  }
  if (allDrained)
    return 2;
  if (!hasData)
    return 1;
  return 0;
};

// Fibre running scheduler
FiberRuntime.prototype._actualRun = function () {
  this._queue = this._genInitialQueue();
  var setPortRuntime = function (port) {
    port[1].setRuntime(this);
  }.bind(this);

  this._list.forEach(function (process) {
    process.inports.forEach(setPortRuntime);
    process.outports.forEach(setPortRuntime);
  });

  while (true) {
    this._tick();

    if (this._count <= 0) {
      break;
    }

    if (this._hasDeadLock()) {
      console.log('Deadlock detected');
      for (var i = 0; i < this._list.length; i++) {
        console.log('- Process status: '
          + this._list[i].getStatusString() + ' - '
          + this._list[i].name);
      }
      throw 'DEADLOCK';
    }
    sleep(50);
  }
};

FiberRuntime.prototype._tick = function () {

    var x = this._queue.shift();

  while (x != undefined) {

    if (x.status != Process.Status.DONE) {
      x.status = Process.Status.ACTIVE;

      trace("Yield/return: state of future events queue: ");
      trace("- " + x.name + " - status: " + x.getStatusString());
      trace("--- ");
      for (var i = 0; i < this._queue.length; i++) {
        var y = this._queue[i];
        trace("- " + y.name + " - status: " + y.getStatusString());
      }
      trace("--- ");


      if (x.fiber == null) {
        x = this._createFiber(x);
      }

      while (true) {
        if (x.status == Process.Status.DORMANT
          && 2 == this._procState(x)) {
          this._close(x);
          break;
        } else if (x.status != Process.Status.CLOSED) {
          if (!x.cbpending) {
            x.status = Process.Status.ACTIVE;

            // --------------------------
            x.fiber.run(x.result);
            // ---------------------------

          }
          // this._logProcessInfo(x);
          x.data = null;
          if (x.yielded)
            break;

          if (!x.yielded && !x.cbpending) {
            // if (this._areUpConnsClosed(x)) {
            if (2 == this._procState(x)) {
              this._close(x);
              break;
            }

            if (1 == this._procState(x)) {
              x.status = Process.Status.DORMANT;
              for (i = 0; i < x.inports.length; i++) {
                var inport = x.inports[i];
                if (inport[1].conn instanceof IIPConnection) {
                  inport[1].conn.closed = false;
                }
              }
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
