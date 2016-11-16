"use strict";
/**
 * This component writes a binary file based on IPs that it receives.
 * The IPs are written out as the IPs come in, so the writing goes in pace with data flowing in.
 * This should make things a lot faster (and less memory hungry) for large files.
 * File name is given by the FILE inport
 */

var fs = require('fs');
var trace = require('../core/trace');

module.exports = function reader(runtime) {
  var filePort = this.openInputPort('FILE');
  var ip = filePort.receive();
  var fname = ip.contents;
  this.dropIP(ip);

  trace("Opening file: " + fname);
  var openResult = runtime.runAsyncCallback(openFile(fname, 'w', this));

  var fileDescriptor = openResult[1];
  if (fileDescriptor == undefined) {
    console.log("OPEN error: " + openResult);
    return;
  }
  trace("Got fd: " + fileDescriptor);

  var inPort = this.openInputPort('IN');
  trace("Starting read");
  var bracket = inPort.receive();
  if(bracket.type != this.IPTypes.OPEN) {
    console.log("ERROR: Received non OPEN bracket");
    console.log(bracket);
    return;
  }
  this.dropIP(bracket);

  writeFile(runtime, this, fileDescriptor, inPort);

  fs.closeSync(fileDescriptor);
};

function writeFile(runtime, proc, fileDescriptor, inPort) {
  do {
    var inIP = inPort.receive();
    if(inIP.type == proc.IPTypes.NORMAL) {
      var writeResult = runtime.runAsyncCallback(writeData(fileDescriptor, inIP.contents));
      if (writeResult[0]) {
        console.error(writeResult[0]);
        return;
      }
      if(writeResult[1] !== 1) {
        console.error("Insufficient data written!");
        return;
      }
    }
    proc.dropIP(inIP);
  } while (inIP.type != proc.IPTypes.CLOSE);
}

function openFile(path, flags) {
  return function (done) {
    fs.open(path, flags, function (err, fd) {
      done([err, fd]);
    });
  }
}

function writeData(fd, byte) {
  return function (done) {
    var writeBuffer = new Buffer(1);
    writeBuffer[0] = byte;
    fs.write(fd, writeBuffer, 0, 1, null, function(err, written) {
      done([err, written]);
    });
  }
}

