/*
 * A very simple FIFO queue
 *  - enqueue: add an item to the queue
 *  - dequeue: take the next item from the queue
 *  - isEmpty: returns `true` if there are no items in the FIFO
 *
 * This method provides better performance than just using Array#push and Array#unshift
 */
var FIFO = function () {
  this.queue = [];
  this.cursor = 0;
  this.length = 0;
};

FIFO.prototype.enqueue = function (value) {
  this.queue.push(value);
  this.length += 1;

};

FIFO.prototype.dequeue = function () {
  var value = this.queue[this.cursor];
  this.cursor += 1;
  this.length -= 1;
  if (this.cursor > this.queue.length / 2) {
    this.queue = this.queue.slice(this.cursor);
    this.length = this.queue.length;
    this.cursor = 0;
  }

  return value;
};

FIFO.prototype.isEmpty = function () {
  return this.length === 0;
};

module.exports = FIFO;
