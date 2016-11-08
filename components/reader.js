'use strict';

var fs = require('fs');

// Reader based on Bruno Jouhier's code
module.exports = function reader(runtime) {
  var inport = this.openInputPort('FILE');
  var ip = inport.receive();
  var fname = ip.contents;
  this.dropIP(ip);

  var result = runtime.runAsyncCallback(myReadFile(fname, "utf8", this));

  if (result[0] == undefined) {
    console.log(result[1]);
    return;
  }

  var outport = this.openOutputPort('OUT');
  var array = result[0].split('\n');
  array.forEach(function (item) {
    var ip = this.createIP(item);
    outport.send(ip);
  }.bind(this));

};

function myReadFile(path, options) {
  return function (done) {
    fs.readFile(path, options, function (err, data) {
      done([data, err]);
    });
  };
}
