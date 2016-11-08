'use strict';

var http = require('http');

module.exports = function httpserver(runtime) {
  var inport = this.openInputPort('PORTNO');
  var outport = this.openOutputPort('OUT');

  var ip = inport.receive();
  var portno = ip.contents;
  var server = http.createServer(handleServerRequest);

  runtime.runAsyncCallback(genListenFun(runtime, server, portno));

  while (true) {
    var result = runtime.runAsyncCallback(genReceiveFun(runtime, server, portno, this));

    for (var i = 0; i < result.length; ++i) {
      var r = result[i];
      outport.send(this.createIPBracket(this.IPTypes.OPEN));
      outport.send(this.createIP(r[0]));
      outport.send(this.createIP(r[1]));
      outport.send(this.createIPBracket(this.IPTypes.CLOSE));
    }
  }
};

// TODO move globals into function:
var rx = null;

var wq = [];

function handleServerRequest(req, res) {
  wq.push([req, res]);

  if (rx !== null) {
    var q = wq;
    wq = [];
    rx(q);
  }
}

function genListenFun(runtime, server, portno) {
  return function (done) {
    // In next tick (TODO use process.nextTick() instead):
    setTimeout(function () {
      done();
    }, 0);

    server.listen(portno, function () {
      console.log('server listen cb');
    });
  };
}

function genReceiveFun() {
  return function (done) {
    rx = function (q) {
      done(q);
    }
  };
}
