'use strict';

var chai = require('chai');

global.expect = chai.expect;

global.MockSender = require('./mocks/MockSender');

global.MockReceiver = require('./mocks/MockReceiver');
