var Fiber = require('fibers');

var DefaultRuntime = function (processName) {
  this.processName = processName;
  this.handlers = {};

  process.on('message', this.handle.bind(this));
};

DefaultRuntime.prototype.setOutQueues = function (outQueues) {
  this.outQueues = outQueues;
};

DefaultRuntime.prototype.addHandler = function (type, handler) {
  this.handlers[type] = handler;
};

DefaultRuntime.prototype.dispatch = function (type, payload) {
  return {
    from: function (portName) {
      process.send('message'
        , {
          type: type
          , from: {
            process: this.processName
            , portName: portName
          }
          , payload: payload || {}
        })
    }
  }
};

DefaultRuntime.prototype.handle = function (message) {
  if (this.handlers[message.type]) {
    this.handlers[message.type](message);
  } else {
    console.error('Received message of unknown type: ' + message.type);
  }
};

DefaultRuntime.prototype.wait = function () {
  return Fiber.yield();
};

DefaultRuntime.prototype.resume = function (payload) {
  var fiber = Fiber.current;
  process.nextTick(function () {
    fiber.run(payload);
  });
};

module.exports = DefaultRuntime;
