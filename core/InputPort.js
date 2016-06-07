'use strict';

var Port = require('./Port');

class InputPort extends Port {
  constructor(process, port) {
    super(process, port);
    if(process) {
      process.addInputPort(this);
    } else {
      console.log("No process passed to input port: " + port);
    }
  }

  receive() {
    var conn = this.conn;
    return conn.getData();
  }

  close() {
    var conn = this.conn;
    conn.closeFromInPort();
    this.closed = true;
  }
}


module.exports = InputPort;
