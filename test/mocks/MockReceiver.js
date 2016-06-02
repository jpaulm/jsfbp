
var MockReceiverGenerator = function (outputArray) {
  if(!outputArray) {
    outputArray = [];
  }
  var MockReceiver = function () {
    var inport = this.openInputPort('IN');
    var ip;
    while ((ip = inport.receive()) !== null) {
      if (ip.type === this.IPTypes.NORMAL) {
        outputArray.push(ip.contents);
      }
      this.dropIP(ip);
    }
  };

  MockReceiver.getResult = function() {
    return outputArray;
  };
  return MockReceiver;
};

MockReceiver = MockReceiverGenerator();
MockReceiver.generator = MockReceiverGenerator;


module.exports = MockReceiver;
