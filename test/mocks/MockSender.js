
var MockSenderGenerator = function (inputArray) {
  initByPort = false;
  if(!inputArray) {
    var initByPort = true;
  }
  return function () {
    if(initByPort) {
      var inport = this.openInputPort('DATA');
      var inputJSON = inport.receive();
      inputArray = JSON.parse(inputJSON.contents);
      this.dropIP(inputJSON);
    }
    var outport = this.openOutputPort('OUT');
    var proc = this;
    inputArray.forEach(function (item) {
      if(item === "IP.OPEN" || item === "IP.CLOSE") {
        var bracket = item.split('.')[1];
        outport.send(proc.createIPBracket(proc.IPTypes[bracket]));
      } else {
        outport.send(proc.createIP(item));
      }
    });
  };
};

MockSender = MockSenderGenerator();

module.exports = MockSender;
MockSender.generator = MockSenderGenerator;
