'use strict';

var Fiber = require('fibers')
  , IIPConnection = require('./IIPConnection')
  , ProcessStatus = require('./Process').Status;

var InputPort = module.exports = function () {
  this.name = null;
  this.conn = null;  // either ProcessConnection or IIPConnection
  //this.closed = false;
};

InputPort.prototype.setRuntime = function (runtime) {
  this._runtime = runtime;
};

InputPort.prototype.receive = function () {
  var proc = Fiber.current.fbpProc;
  var conn = this.conn;

  if (conn instanceof IIPConnection) {
    if (global.tracing)
      console.log(proc.name + ' recv IIP from port ' + this.name + ': ' + conn.contents);
    //var ip = new exports.IP(conn + '');
    var ip = proc.createIP(conn.contents);
    conn.closed = true;
    ip.user = proc;
    //console.log(conn);
    return ip;
  }

  if (global.tracing)
    console.log(proc.name + ' recv from ' + this.name);

  while (true) {
    if (conn.usedslots == 0) {
      if (conn.closed) {
        if (global.tracing)
          console.log(proc.name + ' recv EOS from ' + this.name);
        return null;
      }
      proc.status = ProcessStatus.WAITING_TO_RECEIVE;
      proc.yielded = true;
      Fiber.yield();
      proc.status = ProcessStatus.ACTIVE;
      proc.yielded = false;
    }
    else
      break;
  }
  //if (conn.usedslots == conn.array.length)
  for (var i = 0; i < conn.up.length; i++) {
    if (conn.up[i].status == ProcessStatus.WAITING_TO_SEND) {
      conn.up[i].status = ProcessStatus.READY_TO_EXECUTE;
      this._runtime.pushToQueue(conn.up[i]);
    }
  }

  ip = conn.array[conn.nxtget];
  conn.array[conn.nxtget] = null;
  conn.nxtget++;
  if (conn.nxtget > conn.array.length - 1)
    conn.nxtget = 0;
  var cont = ip.contents;
  if (global.tracing) {
    if (ip.type != proc.IPTypes.NORMAL) {
      cont = ["", "OPEN", "CLOSE"][ip.type] + ", " + cont;
    }
    console.log(proc.name + ' recv OK: ' + cont);
  }
  conn.usedslots--;
  ip.owner = proc;
  proc.ownedIPs++;
  return ip;
};

InputPort.prototype.close = function () {
  var proc = Fiber.current.fbpProc;
  var conn = this.conn;
  conn.closed = true;
  console.log(proc.name + ': ' + conn.usedslots + ' IPs dropped because of close on ' + conn.name);
  while (true) {
    conn.array[conn.nxtget] = null;
    conn.nxtget++;
    if (conn.nxtget > conn.array.length - 1)
      conn.nxtget = 0;
    conn.usedslots--;
    if (conn.usedslots <= 0)
      break;
  }
  for (var i = 0; i < conn.up.length; i++) {
    if (conn.up[i].status == ProcessStatus.WAITING_TO_SEND)
      this._runtime.pushToQueue(conn.up[i]);
  }
};
