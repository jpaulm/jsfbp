'use strict';

var Enum = require('./Enum')
  , trace = require('./trace');

var IP = module.exports = function IP(contents) {
  this.owner = null;
  this.type = IP.Types.NORMAL;
  this.contents = contents;
};

IP.prototype.toString = function () {
  var cont = this.contents;

  if (this.type != IP.Types.NORMAL) {
    cont = IP.Types.__lookup(this.type) + ", (" + cont + ")";
  }

  return cont;
};

IP.create = function(type, contents, owner) {
  if (contents == undefined) {
    contents = null;
  }
  var ip = new IP(contents);
  ip.type = type;

  ip.owner = owner;
  trace("Bracket IP created: " + IP.Types.__lookup(ip.type) + ", " + ip.contents);

  return ip;
};




IP.Types = new Enum([
  "NORMAL",
  "OPEN",
  "CLOSE"
]);

["NORMAL", "OPEN", "CLOSE"].forEach(function (type) {
  Object.defineProperty(IP, type, {
    get: function () {
      console.error("Accessing IP types from IP object directly is deprecated. Please use IP.Types." + type);
      return IP.Types[type]
    }
  });
});
