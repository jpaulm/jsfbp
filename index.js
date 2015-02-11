'use strict';

var Fiber = require('fibers')
  , IP = require('./core/IP')
  , Process = require('./core/Process')
  , Connection = require('./core/Connection')
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
}

var list = []; // list of processes
var queue = []; // list of processes ready to continue

global.tracing = false;
//var currentproc;
var count;

function close(proc) {
  if (tracing)
    console.log(proc.name + ' closing');
  proc.status = 'C';
  //console.log('cl' + count);
  count--;
  for (var i = 0; i < proc.outports.length; i++) {

    var conn = proc.outports[i][1].conn;
    if (conn.down.status == 'R' || conn.down.status == 'N' /*|| conn.down.status == 'D' */ ) {
      conn.down.status = 'K';
      queue.push(conn.down);
    }
    conn.upstreamProcsUnclosed--;
    if ((conn.upstreamProcsUnclosed) <= 0)
      conn.closed = true;
  }

  for (var i = 0; i < proc.inports.length; i++) {
    var conn = proc.inports[i][1].conn;
    if (conn.constructor == Utils.InitConn)
      continue;
    for (var j = 0; j < conn.up.length; j++) {
      if (conn.up[j].status == 'S')
        queue.push(conn.up[j]);
    }
  }
  if (proc.ownedIPs != 0)
    console.log(proc.name + ' closed without disposing of all IPs');
  if (tracing)
    console.log(proc.name + ' closed');
}

module.exports.getCurrentProc = function() {
  //console.log('get ' + currentproc);
  return Fiber.current.fbpProc;
}

//exports.setCurrentProc = function(proc)  {
//console.log('get ' + currentproc);
//  currentproc = proc;
//}

module.exports.queueCallback = function(proc, data) {
  if (tracing)
    console.log('queue ' + proc.name);
  if (data != undefined)
    proc.data = data;
  queue.push(proc);
}

module.exports.setCallbackPending = function(b) {
  Fiber.current.fbpProc.cbpending = b;
}

module.exports.initialize = function(proc, port, string) {
  var inport = new InputPort(queue);
  inport.name = proc.name + "." + port;
  inport.conn = new Utils.InitConn(string);
  proc.inports[proc.inports.length] = [proc.name + '.' + port, inport];
}

exports.connect = function(upproc, upport, downproc, downport, capacity) {
  if (capacity == undefined)
    capacity = 10;
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

    var cnxt = new Connection(capacity);
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
}

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
  //console.log(list);
  for (var i = 0; i < list.length; i++) {

    var selfstarting = true;
    for (var j = 0; j < list[i].inports.length; j++) {
      var k = list[i].inports[j];
      if (k[1].conn.constructor != Utils.InitConn)
        selfstarting = false;
    }

    if (selfstarting)
      queue.push(list[i]);
  }

  while (true) {

    var x = queue.shift();
    while (x != undefined) {
      //currentproc = x;  
      if (x.fiber == null) {
        x.fiber = new Fiber(x.func);
        x.fiber.fbpProc = x;
        //console.log(x.fiber.fbpProc);
        x.status = 'A';
      }

      if (x.status != 'C') {
        if (x.status == 'D' && upconnsclosed(x))
          close(x);
        else {

          if (tracing) {
            if (x.yielded)
              console.log(x.name + ' fiber resumed');
            else {
              if (x.cbpending)
                console.log(x.name + ' fiber callback run');
              else
                console.log(x.name + ' fiber started');
            }
          }

          //------------------    
          x.fiber.run(x.data);
          //------------------

          x.data = null;
          if (tracing) {
            console.log(x.name + ' yielded: ' + x.yielded + ', cbpending: ' + x.cbpending);
            if (x.yielded)
              console.log(x.name + ' fiber yielded');
            else {
              if (x.cbpending)
                console.log(x.name + ' fiber awaiting callback');
              else
                console.log(x.name + ' fiber ended');
            }
          }
          if (!x.yielded && !x.cbpending) {

            if (!upconnsclosed(x)) {
              x.status = 'D';
              queue.push(x);
              for (var j = 0; j < x.inports.length; j++) {
                var k = x.inports[j];
                if (k[1].conn.constructor == Utils.InitConn)
                  k[1].conn.closed = false;
              }
            } else
              close(x);
          }
          //else
          //  close(x); 
        }
      }
      x = queue.shift();
    }
    //console.log(count);
    if (count <= 0)
      break;
    var deadlock = true;
    for (var i = 0; i < list.length; i++) {
      if (list[i].cbpending || list[i].status == 'A') {
        deadlock = false;
        break;
      }
    }
    if (deadlock) {
      console.log('Deadlock detected');
      //console.log(list);
      for (var i = 0; i < list.length; i++) {
        console.log('- Process status: ' + list[i].status + ' - ' + list[i].name);
      }
      throw '';
      //return;
    }
    sleep(100); // 100 ms
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
    if (k[1].conn.constructor == Utils.InitConn)
      continue;
    //console.log(k[1]);
    if (!(k[1].conn.closed) || k[1].conn.usedslots > 0)
      return false;
  }
  return true;
}

function sleep(ms) {
  var fiber = Fiber.current;
  //console.log('sleep');
  setTimeout(function() {
    fiber.run();
  }, ms);
  Fiber.yield();
}