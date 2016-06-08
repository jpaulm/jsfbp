/*
 * Receives IPs and records their types
 */
var TypeReceiverGenerator = function (outputArray) {
  if(!outputArray) {
    outputArray = [];
  }
  var TypeReceiver = function () {
    var inport = this.openInputPort('IN');
    var ip;
    while ((ip = inport.receive()) !== null) {
      outputArray.push(ip.type);

      this.dropIP(ip);
    }
  };

  TypeReceiver.getResult = function() {
    return outputArray;
  };
  return TypeReceiver;
};

var TypeReceiver = TypeReceiverGenerator();
TypeReceiver.generator = TypeReceiverGenerator;


module.exports = TypeReceiver;
