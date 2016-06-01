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
      console.log("Got "+ inputArray);
    }
    var outport = this.openOutputPort('OUT');
    var proc = this;
    inputArray.forEach(function (item) {
      outport.send(proc.createIP(item));
    });
  };
};

MockSender = MockSenderGenerator();

module.exports = MockSender;
MockSender.generator = MockSenderGenerator;
