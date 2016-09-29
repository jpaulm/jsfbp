/**
 * Created by danrumney on 9/26/16.
 */

var fork = require('child_process').fork;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var FIFO = require('./FIFO');

var ProcessContainer = function (processDetails) {
  EventEmitter.call(this);

  console.log("Creating FBPProcess");
  this.process = fork(__dirname + '/FBPProcess.js');
  if (!this.process) {
    console.error("FBPProcess not created");
  }

  this.outgoingConnections = _.reduce(processDetails.capacities, function (connections, capacity, portName) {
    connections[portName] = {
      capacity: capacity,
      queue: new FIFO()
    };
    return connections;
  }, {});

  this.process.on('message', function (message) {
    if (message.type === 'STATUS_UPDATE') {
      this.emit('statusChange', {
        name: message.name,
        oldStatus: message.oldStatus,
        newStatus: message.newStatus
      })
    } else if (message.type === 'IP_AVAILABLE') {
      var details = message.details;
      var connection = this.outgoingConnections[details.port];
      connection.queue.enqueue(details.ip);
      if (connection.queue.length < connection.capacity) {
        this.process.send('IP_ACCEPTED');
      }
    } else if (message.type === 'IP_REQUESTED') {
      this.emit('ipRequested', message.details);

    } else {
      console.log('Unknown message: %j', message);
    }
  }.bind(this));

  this.process.send({
    type: "INITIALIZE",
    details: processDetails
  });

};

util.inherits(ProcessContainer, EventEmitter);

module.exports = ProcessContainer;
