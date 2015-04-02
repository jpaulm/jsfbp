'use strict';

//var Connection = require('./Connection');

var IIPConnection = module.exports = function(data) {
  //Connection.call(this);
  this.contents = data;
  this.closed = false;
};
//IIPConnection.prototype = Object.create(Connection.prototype);