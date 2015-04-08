'use strict';

var Fiber = require('fibers');

var IP = module.exports = function IP(contents) {
 // this.NORMAL = 0;
 // this.OPEN = 1;
 // this.CLOSE = 2;
  this.owner = null;
  this.type = IP.NORMAL; 
  this.contents = contents;     
};

IP.NORMAL = 0;
IP.OPEN = 1;
IP.CLOSE = 2;