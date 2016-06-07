var FIFO = require('./FIFO');

var Connection = function () {
  this.closed = false;
  this.contents = new FIFO();
  this._runtime = null;
};

Connection.prototype.setRuntime = function(runtime) {
  this._runtime = runtime;
};

Connection.prototype.close = function () {
  this.closed = true;
};

Connection.prototype.hasData = function () {
  return !this.contents.isEmpty();
};

Connection.prototype.purgeData = function () {
  this.contents = new FIFO();
};

module.exports = Connection;
