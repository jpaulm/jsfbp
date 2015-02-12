'use strict';

'use strict';

var fbp = require('..')
  , InputPort = require('../core/InputPort')
  , IP = require('../core/IP')
	, OutputPort = require('../core/OutputPort');

module.exports = function sender() {
  var inport = InputPort.openInputPort('COUNT');
  var outport = OutputPort.openOutputPort('OUT');
  var ip = inport.receive();
  var count = ip.contents;
  IP.drop(ip);
  //console.log(count);
  for (var i = 0; i < count; i++) {
    var ip = IP.create(i + '');
    if (-1 == outport.send(ip)) {
      return;
    }
  }
}
