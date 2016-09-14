/**
 * Created by danrumney on 9/7/16.
 */

function NetworkMessage(message) {
  Object.assign(this, message);
}

NetworkMessage.prototype.getTargetProcess = function () {
  return this.from.process;
};

NetworkMessage.prototype.getTargetPort = function () {
  return this.from.portName;
};

function NetworkMessageBuilder() {
  this.type = "";
  this.from = {};
  this.payload = {};
}

NetworkMessageBuilder.prototype.setType = function (type) {
  this.type = type;
  return this;
};

NetworkMessageBuilder.prototype.setFromProcess = function (process) {
  if(!this.from) {
    this.from = {};
  }
  this.from.process = process;
  return this;
};

NetworkMessageBuilder.prototype.setFromPort = function (portName) {
  if(!this.from) {
    this.from = {};
  }
  this.from.portName = portName;
  return this;
};

NetworkMessageBuilder.prototype.setPayload = function (payload) {
  this.payload = payload;
  return this;
};

NetworkMessageBuilder.prototype.build = function () {
  var message = {
    type: this.type
    , payload: this.payload
  };

  if(this.from) {
    message.from = this.from;
  }
  if(this.to) {
    message.to = this.to;
  }

  return new NetworkMessage(message);
};



NetworkMessage.Builder = NetworkMessageBuilder;

module.exports = NetworkMessage;
