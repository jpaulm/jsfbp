'use strict';

var IP = module.exports = function IP(contents) {
  this.owner = null;
  this.type = IP.NORMAL;
  this.contents = contents;
};

IP.NORMAL = 0;
IP.OPEN = 1;
IP.CLOSE = 2;
