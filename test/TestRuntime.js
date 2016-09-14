var TestDispatcher = function (processName) {
  this.processName = processName;
  this.handlers = {};
  this.dispatchedMessages = {};
  this.isWaiting = false;
  this.waitHandler = function () {};
};

TestDispatcher.prototype.setOutQueues = function (outQueues) {
  this.outQueues = outQueues;
};

TestDispatcher.prototype.setWaitHandler = function (handler) {
  this.waitHandler = handler;
};

TestDispatcher.prototype.getDispatchedMessages = function (portName) {
  return this.dispatchedMessages[portName] || [];
};

TestDispatcher.prototype.addHandler = function (type, handler) {
  this.handlers[type] = handler;
};

TestDispatcher.prototype.dispatch = function (type, payload) {
  return {
    from: function (portName) {
      if(!this.dispatchedMessages[portName]) {
        this.dispatchedMessages[portName] = []
      }

      this.dispatchedMessages[portName].push({
        type: type
        , from: {
          process: this.processName
          , portName: portName
        }
        , payload: payload || {}
      });

    }.bind(this)
  }
};


TestDispatcher.prototype.handle = function (message) {
  if (this.handlers[message.type]) {
    this.handlers[message.type](message);
  } else {
    console.error('Received message of unknown type: ' + message.type);
  }
};

TestDispatcher.prototype.wait = function () {
  this.isWaiting = true;
  return this.waitHandler();
};

TestDispatcher.prototype.resume = function () {
  this.isWaiting = false;
};

module.exports = TestDispatcher;
