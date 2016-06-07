'use strict';

class Port {
  constructor(process, portName) {
    if(process) {
      this.processName = process.name;
    } else {
      this.processName = '';
    }
    this.portName = portName;
    this.closed = false;
    this._conn = null;
    this._runtime = null;
  }
  
  get name() { return this.processName + "." + this.portName;}
  
  get conn() { return this._conn; }
  set conn(c) { this._conn = c; if (this._runtime) { this._conn.setRuntime(this._runtime); }}
  
  set runtime(r) {
    this._runtime = r;
    if(this._conn) {
      this._conn.setRuntime(this._runtime);
    }
  }
  setRuntime(runtime) {
    this.runtime = runtime;
  }
}


module.exports = Port;
