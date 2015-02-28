'use strict';

var Fiber = require('fibers');

var IP = module.exports = function IP(contents) {
  this.NORMAL = 0;
  this.OPEN = 1;
  this.CLOSE = 2;
  this.owner = null;
  this.type = this.NORMAL;  
  this.contents = contents;     
};