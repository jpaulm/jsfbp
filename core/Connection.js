'use strict';

var Connection = module.exports = function(size){
  this.name = null; 
  this.array = [];
  this.nxtget = 0;
  this.nxtput = 0; 
  this.up = [];    // list of upstream processes
  this.down = null;  // downstream process
  this.closed = false;
  this.usedslots = 0;
  this.upstreamProcsUnclosed = 0; 
  for (var i = 0; i < size; i++)
    this.array[i] = null;
}