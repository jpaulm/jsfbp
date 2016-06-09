"use strict";
/**
 * This component writes a binary file based on IPs that it receives.
 * The IPs are written out as the IPs come in, so the writing goes in pace with data flowing in.
 * This should make things a lot faster (and less memory hungry) for large files.
 * File name is given by the FILE inport
 */

var fs = require('fs');
var trace = require('../core/trace');

var WRITE_SIZE = 4;

function getChunkSize() {
  var size = WRITE_SIZE;
  var sizePort = this.openInputPort('SIZE');
  if (sizePort) {
    var sizeIP = sizePort.receive();
    if (sizeIP) {
      size = parseInt(sizeIP.contents, 10);
    }
    this.dropIP(sizeIP);
  }
  return size;
}

module.exports = function reader(runtime) {
  var chunkSize = getChunkSize.call(this);

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
  trace("Starting write");
  var bracket = inPort.receive();
  if (bracket.type != this.IPTypes.OPEN) {
    console.log("ERROR: Received non OPEN bracket");
    console.log(bracket);
    return;
  }
  this.dropIP(bracket);

  writeFile(runtime, this, fileDescriptor, inPort, chunkSize);

  fs.closeSync(fileDescriptor);
};

function writeFile(runtime, proc, fileDescriptor, inPort, size) {
  var buffer = new Buffer(size);
  var byteCount = 0;
  do {
    var inIP = inPort.receive();
    if (inIP.type == proc.IPTypes.NORMAL) {
      buffer.writeUInt8(inIP.contents, byteCount);
      byteCount++;
      if (byteCount === size) {
        var success = writeBuffer(runtime, fileDescriptor, buffer, byteCount);
        if (!success) {
          return;
        }
        byteCount = 0;
      }
    }
    proc.dropIP(inIP);
  } while (inIP.type != proc.IPTypes.CLOSE);
  if (byteCount > 0) {
    writeBuffer(runtime, fileDescriptor, buffer, byteCount);
  }
}

function openFile(path, flags) {
  return function (done) {
    fs.open(path, flags, function (err, fd) {
      done([err, fd]);
    });
  }
}

function writeBuffer(runtime, fileDescriptor, writeBuffer, byteCount) {
  var writeResult = runtime.runAsyncCallback(writeData(fileDescriptor, writeBuffer, byteCount));
  if (writeResult[0]) {
    console.error(writeResult[0]);
    return false;
  }
  if (writeResult[1] !== byteCount) {
    console.error("Insufficient data written!");
    return false;
  }

  return true;
}

function writeData(fd, writeBuffer, count) {
  return function (done) {
    fs.write(fd, writeBuffer, 0, count, null, function (err, written) {
      done([err, written]);
    });
  }
}
