'use strict';
var Fiber = require('fibers')
  , ProcessStatus = require('./Process').Status
  , trace = require('./trace');

var OutputPort = module.exports = function () {
  this.name = null;
  this.conn = null;
  this.closed = false;
};

OutputPort.prototype.setRuntime = function (runtime) {
  this._runtime = runtime;
};

OutputPort.prototype.send = function (ip) {
  var proc = Fiber.current.fbpProc;
  var conn = this.conn;
  var cont = ip.contents;
  if (ip.type != proc.IPTypes.NORMAL) {
    cont = proc.IPTypes.__lookup(ip.type) + ", " + cont;
  }
  trace('send to ' + this.name + ': ' + cont);

  if (ip.owner != proc) {
    console.log(proc.name + ' IP being sent not owned by this Process: ' + cont);
    return;
  }
  if (conn.closed) {
    console.log(proc.name + ' sending to closed connection: ' + conn.name);
    return -1;
  }
  while (true) {
    if (conn.down.status == ProcessStatus.WAITING_TO_RECEIVE ||
      conn.down.status == ProcessStatus.NOT_INITIALIZED ||
      conn.down.status == ProcessStatus.DORMANT ||
      conn.down.status == ProcessStatus.WAITING_TO_FIPE) {
      conn.down.status = ProcessStatus.READY_TO_EXECUTE;
      this._runtime.pushToQueue(conn.down);  
    }
    if (conn.usedslots == conn.array.length) {
      proc.yield(ProcessStatus.WAITING_TO_SEND, ProcessStatus.WAITING_TO_SEND);
    }
    else {
      break;
    }
  }
  conn.array[conn.nxtput] = ip;
  conn.nxtput++;
  if (conn.nxtput > conn.array.length - 1) {
    conn.nxtput = 0;
  }
  conn.usedslots++;
  proc.ownedIPs--;
  trace('send OK: ' + cont);

  return 0;
};
