'use strict';

module.exports = function (size) {
  this.name = null;
  this.nxtget = 0;
  this.nxtput = 0;
  this.down = null;  // downstream process
  this.usedslots = 0;
  this.array = [];
  this.up = [];    // list of upstream processes
  this.upstreamProcsUnclosed = 0;
  for (var i = 0; i < size; i++) {
    this.array[i] = null;
  }
  this.closed = false;
};
