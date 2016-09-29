var fs = require('fs');

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
    return function (done) {
      fs.open(path, flags, function (err, fd) {
        done([err, fd]);
      });
    }
  },

  readFile: function (path, flags) {
    return function (done) {
      fs.read(path, flags, function (err, fd) {
        done([err, fd]);
      });
    }
  }
};
