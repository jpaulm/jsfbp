/**
 * Created by danrumney on 5/27/16.
 */

var Fiber = require('fibers');

module.exports = function (message) {
  if (global.trace) {
    var calledAs = "";
    if (this && this.name) {
      calledAs = this.name;
    }
    var fiberProc = "no-fiber";
    if (Fiber.current) {
      if (Fiber.current.fbpProc) {
        fiberProc = Fiber.current.fbpProc.name;
      } else {
        fiberProc = "runtime";
      }
    }

    var tag = "[" + fiberProc + "->" + calledAs + "]";
    if (fiberProc === calledAs) {
      tag = "[" + calledAs + "]";
    } else if (!calledAs) {
      tag = "[" + fiberProc + "]";
    }

    console.log(tag + ' ' + message);
  }
};
