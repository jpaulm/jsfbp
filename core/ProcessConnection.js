'use strict';
var Fiber = require('fibers'),
  ProcessStatus = require('./FBPProcess').Status,
  Connection = require('./Connection'),
  _ = require('lodash');

var ProcessConnection = function (size) {
  this.parent.constructor.call(this);

  this.name = null;
  this.capacity = size;

  this.downStreamProcess = null; // downstream process
  this.upSteamProcesses = []; // list of upstream processes
  this.upstreamProcsUnclosed = 0;
};

ProcessConnection.prototype = Object.create(Connection.prototype);
ProcessConnection.prototype.constructor = ProcessConnection;
ProcessConnection.prototype.parent = Connection.prototype;


ProcessConnection.prototype.getData = function () {
  var proc = Fiber.current.fbpProc;

  while (!this.hasData()) {
    if (this.closed) {
      return null;
    }

    proc.yield(ProcessStatus.WAITING_TO_RECEIVE);
  }

  var runtime = this._runtime;
  var queueProcess = function (process) {
    if (process.status == ProcessStatus.WAITING_TO_SEND) {
      runtime.queueForExecution(process);
    }
  };
  this.upSteamProcesses.forEach(queueProcess);

  var ip = this.contents.dequeue();
  ip.owner = proc;
  proc.ownedIPs++;
  return ip;
};

ProcessConnection.prototype.putData = function (ip) {
  var proc = Fiber.current.fbpProc;
  var cont = ip.contents;

  if (ip.type != proc.IPTypes.NORMAL) {
    cont = proc.IPTypes.__lookup(ip.type) + ", " + cont;
  }

  if (ip.owner != proc) {
    console.log(proc.name + ' IP being sent not owned by this FBPProcess: ' + cont);
    return;
  }
  if (this.closed) {
    console.log(proc.name + ' sending to closed connection: ' + this.name);
    return -1;
  }
  while (true) {
    var downStreamStatus = this.downStreamProcess.status;
    if (downStreamStatus == ProcessStatus.WAITING_TO_RECEIVE ||
      downStreamStatus == ProcessStatus.NOT_INITIALIZED ||
      downStreamStatus == ProcessStatus.DORMANT ||
      downStreamStatus == ProcessStatus.WAITING_TO_FIPE) {

      this._runtime.queueForExecution(this.downStreamProcess);
    }
    if (this.contents.length >= this.capacity) {
      proc.yield(ProcessStatus.WAITING_TO_SEND, ProcessStatus.WAITING_TO_SEND);
    } else {
      break;
    }
  }
  this.contents.enqueue(ip);

  proc.ownedIPs--;

  return 0;
};


ProcessConnection.prototype.closeFromUpstream = function () {

  var status = this.downStreamProcess.status;
  if (status == ProcessStatus.WAITING_TO_RECEIVE ||
    status == ProcessStatus.NOT_INITIALIZED) {
    this._runtime.queueForExecution(this.downStreamProcess);
  }
  this.upstreamProcsUnclosed--;
  if ((this.upstreamProcsUnclosed) <= 0) {
    this.closed = true;
  }

};

ProcessConnection.prototype.closeFromDownstream = function () {
  var runtime = this._runtime;
  this.upSteamProcesses.forEach(function (up) {
    if (up.status == ProcessStatus.CLOSED) {
      up.status = ProcessStatus.DONE;
      runtime.pushToQueue(up);
    }
  });
};

ProcessConnection.prototype.closeFromInPort = function () {
  var proc = Fiber.current.fbpProc;

  this.closed = true;
  if (this.hasData()) {
    console.log(proc.name + ': ' + this.contents.length + ' IPs dropped because of close on ' + this.name);
  }
  this.purgeData();
  var runtime = this._runtime;

  _.forEach(this.upSteamProcesses, function (process) {
    runtime.pushToQueue(process);
  });
};

ProcessConnection.prototype.connectProcesses = function (upproc, outport, downproc, inport) {
  inport.conn = this;
  outport.conn = this;

  this.upSteamProcesses.push(upproc);
  this.downStreamProcess = downproc;
  this.upstreamProcsUnclosed++
};

module.exports = ProcessConnection;
