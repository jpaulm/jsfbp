/**
 * Created by danrumney on 9/28/16.
 */

var NetworkRouter = function (connections) {
  this.connections = connections;
  console.log("NetworkRouter", connections);
};

NetworkRouter.prototype.getSendTarget = function (source) {
  var process = source.process;
  var port = source.port;

  var target = this.connections[process].out[port];

  return {
    process: target.process,
    port: target.port
  }
};

NetworkRouter.prototype.getReceiveTargets = function (source) {
  var process = source.process;
  var port = source.port;

  var target = this.connections[process].in[port];

  return {
    process: target.process,
    port: target.port
  }
};


module.exports = NetworkRouter;
