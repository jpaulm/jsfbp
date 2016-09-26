var PortScaffold = function (options) {
  this.name = options.name;
  this.type = options.type;
  this.eos = false;

  this.buffer = options.buffer;
  this.cursor = 0;
};

PortScaffold.prototype.receive = function () {
  if(this.type !== "IN" && this.type !== "IIP") {
    throw new Error("Called 'receive' on an outport: " + this.name);
  }
  if(this.eos) {
    return null;
  }

  var ip = this.buffer[this.cursor];
  this.cursor++;

  this.eos = this.cursor >= this.buffer.length;


  return ip;
};

PortScaffold.prototype.send = function (ip) {
  if(this.type !== "OUT") {
    throw new Error("Called 'send' on an inport: " + this.name);
  }

  this.buffer.push(ip);
};

PortScaffold.prototype.getBuffer = function () {
  return this.buffer;
};

module.exports = PortScaffold;