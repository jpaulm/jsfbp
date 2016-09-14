'use strict';

var chai = require('chai');
var Fiber = require('fibers');
var Process = require('../core/Component');

global.expect = chai.expect;

global.MockSender = require('./mocks/MockSender');

global.MockReceiver = require('./mocks/MockReceiver');
global.TypeReceiver = require('./mocks/TypeReceiver');


global.TestFiber = function(action) {
  Fiber(function() {
    var mockProcess = new Process("test", function() {console.log("Test Component");});

    Fiber.current.fbpProc = mockProcess;
    action(mockProcess);
  }).run();
};
