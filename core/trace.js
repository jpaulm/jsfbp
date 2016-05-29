/**
 * Created by danrumney on 5/27/16.
 */

var Fiber = require('fibers');

module.exports = function(message) {
  var proc = Fiber.current.fbpProc;
  if(global.trace) {
    console.log(proc.name + ' ' + message);
  }
};
