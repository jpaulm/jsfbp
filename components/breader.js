"use strict";
/**
 * This component reads a file and sends one IP per byte of the file to OUT
 * The IPs are streamed out as the file is read, so the network can start flowing as soon as reading begins.
 * This should make things a lot faster (and less memory hungry) for large files.
 * File name is given by the FILE inport
 */

var fs = require('fs');
var trace = require('../core/trace');

var READ_SIZE = 4;

module.exports = function reader(runtime) {
  var inport = this.openInputPort('FILE');
  var ip = inport.receive();
  var fname = ip.contents;
  this.dropIP(ip);

  trace("Opening file: " + fname);
  var openResult = runtime.runAsyncCallback(openFile(fname, 'r', this));

  var fileDescriptor = openResult[1];
  if (fileDescriptor == undefined) {
    console.log("OPEN error: " + openResult);
    return;
  }
  trace("Got fd: " + fileDescriptor);

  var outport = this.openOutputPort('OUT');
  trace("Starting read");
  outport.send(this.createIPBracket(this.IPTypes.OPEN));
  readFile(runtime, this, fileDescriptor, outport);

  fs.closeSync(fileDescriptor);
  outport.send(this.createIPBracket(this.IPTypes.CLOSE));

};

function readFile(runtime, proc, fileDescriptor, outport) {
  do {
    var readResult = runtime.runAsyncCallback(readData(fileDescriptor, READ_SIZE));
    if (readResult[0]) {
      console.error(readResult[0]);
      return;
    }
    var bytesRead = readResult[1];
    var data = readResult[2];

    for (var i = 0; i < bytesRead; i++) {
      var byte = data[i];
      trace("Got byte: " + byte);
      outport.send(proc.createIP(byte));
    }
  } while (bytesRead === READ_SIZE);
}

function openFile(path, flags) {
  return function (done) {
    fs.open(path, flags, function (err, fd) {
      done([err, fd]);
    });
  }
}

function readData(fd, size) {
  return function (done) {
    fs.read(fd,new Buffer(size), 0, size, null, function(err, bytesRead, buffer) {
      done([err, bytesRead, buffer]);
    });
  }
}

