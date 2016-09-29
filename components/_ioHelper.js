var fs = require('fs');

function makeFBPFSCallback(fsFunction, path, flags) {
  return function (done) {
    fs[fsFunction].call(fs, path, flags, function (err, fd) {
      done([err, fd]);
    });
  }
}

module.exports = {
  getChunkSize: function (defaultSize) {
    var size = defaultSize || 1;
    var sizePort = this.openInputPort('SIZE');
    if (sizePort) {
      var sizeIP = sizePort.receive();
      if (sizeIP) {
        size = parseInt(sizeIP.contents, 10);
      }
      this.dropIP(sizeIP);
    }
    return size;
  },

  openFile: function (path, flags) {
    return makeFBPFSCallback('open', path, flags);
  },

  readFile: function (path, flags) {
    return makeFBPFSCallback('read', path, flags);
  }
};
