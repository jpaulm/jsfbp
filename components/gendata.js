module.exports = function () {
  var sizePort = this.openInputPort('IN');
  var sizeIP = sizePort.receive();
  var size = parseInt(sizeIP.contents, 10);
  this.dropIP(sizeIP);

  var outPort = this.openOutputPort('OUT');
  for (var i = 0; i < size; i++) {
    outPort.send(this.createIP(i));
  }
};
