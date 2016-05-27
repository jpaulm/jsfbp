'use strict';

var fs = require('fs');

module.exports = function writer(runtime) {
  var inport = this.openInputPort('FILE');
  var dataport = this.openInputPort('IN');
  var ip = inport.receive();
  var fname = ip.contents;
  this.dropIP(ip);
  var string = '';
  while (true) {
    ip = dataport.receive();
    if (ip === null) {
      break;
    }
    string += ip.contents + '\n';
    this.dropIP(ip);
  }

  var result = runtime.runAsyncCallback(myWriteFile(fname, string, "utf8", this));
  console.log('write complete: ' + this.name);
  if (result != null) {
    console.log(result);
  }
};

function myWriteFile(path, data, options, proc) {
  return function (done) {
    console.log('write started: ' + proc.name);
    fs.writeFile(path, data, options, function (err) {
      done(err);
    });
    console.log('write pending: ' + proc.name);
  };
}
