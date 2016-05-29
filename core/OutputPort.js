'use strict';
var Fiber = require('fibers')
  , ProcessStatus = require('./Process').Status
  , IP = require('./IP');

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
  if (ip.type != IP.NORMAL) {
    cont = ["", "OPEN", "CLOSE"][ip.type] + ", " + cont;
  }
  if (global.tracing) {
    console.log(proc.name + ' send to ' + this.name + ': ' + cont);
  }
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
      proc.status = ProcessStatus.WAITING_TO_SEND;
      proc.yielded = true;
      Fiber.yield();
      //proc.status = ProcessStatus.ACTIVE;
      proc.yielded = false;
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
  if (global.tracing) {
    console.log(proc.name + ' send OK: ' + cont);
  }
  return 0;
};
