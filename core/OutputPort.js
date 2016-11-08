'use strict';


var Port = require('./Port');

var OutputPort = function (process, port) {
  this.parent.constructor.call(this, process, port);
  process.addOutputPort(this);
};

OutputPort.prototype = Object.create(Port.prototype);
OutputPort.prototype.constructor = OutputPort;
OutputPort.prototype.parent = Port.prototype;

OutputPort.prototype.send = function (ip) {
  var conn = this.conn;

  return conn.putData(ip, this.name);

};

module.exports = OutputPort;
