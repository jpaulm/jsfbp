'use strict';


var Port = require('./Port');

class OutputPort extends Port {
  constructor(process, port) {
    super(process, port);
    process.addOutputPort(this);
  }
  
  send(ip) {
    var conn = this.conn;

    return conn.putData(ip, this.name);
  }
}

module.exports = OutputPort;
