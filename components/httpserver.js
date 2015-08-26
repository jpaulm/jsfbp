'use strict';

var IP = require('../core/IP')
  , http = require('http');

module.exports = function httpserver(runtime) {
  var inport = this.openInputPort('PORTNO');
  var outport = this.openOutputPort('OUT');

  var ip = inport.receive();
  var portno = ip.contents;
  var server = http.createServer(handleWebRequest);

  runtime.runAsyncCallback(genListenFun(runtime, server, portno, this));

  while (true) {
    var result = runtime.runAsyncCallback(genWsReceiveFun(runtime, server, portno, this));

    for (var i=0; i<result.length; ++i) {
      var r = result[i];
      outport.send(this.createIPBracket(IP.OPEN));
      outport.send(this.createIP(r.req));
      outport.send(this.createIP(r.res));
      outport.send(this.createIPBracket(IP.CLOSE));
    }
  }

  wss.close();
  this.dropIP(ip);
}

// TODO move globals into function:
var rx = null;

var wq = [];

function handleWebRequest(req, res) {
  console.log('got req url: ' + req.url);
  wq.push({req: req, res: res});

  if (!!rx) {
    var q = wq;
    wq = [];
    rx(q);
  }
}

function genListenFun(runtime, server, portno, proc) {
  return function (done) {
    // In next tick (TODO use process.nextTick() instead):
    setTimeout(function() {
      done();
    }, 0);

    server.listen(portno, function() { console.log('server listen cb'); });
  };
}

function genWsReceiveFun(runtime, server, portno, proc) {
  return function (done) {
    rx = function(q) {
      done(q);
    }
  };
}
