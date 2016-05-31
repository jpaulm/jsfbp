'use strict';

/**
 * This component simply compares 2 files, and outputs an 'OK' to the console if they match exactly;
 * otherwise it outputs a 'FAIL'
 *
 * It is a general component, but it seems appropriate to include it in examples/components
 *
 * Amusingly, I had forgotten that the input streams have to be drained - otherwise the compare
 * process will keep on getting reinvoked indefinitely.  The drainInputs logic has now been added.
 */

module.exports = function compare() {

  var inportArray = this.openInputPortArray('IN');

  while (true) {
    var ip0 = inportArray[0].receive();
    var ip1 = inportArray[1].receive();
    if (ip0 == null && ip1 == null) {
      console.log('OK');
      return;
    }

    if (ip0 == null || ip1 == null) {
      if (ip0 == null) {
        console.log(ip1.type + ',' + ip1.contents);
      }
      if (ip1 == null) {
        console.log(ip0.type + ',' + ip0.contents);
      }
      console.log('FAIL1');
      drainInputs(this);
      return;
    }
    if (ip0.type != ip1.type) {
      console.log(ip0.type + ',' + ip0.contents);
      console.log(ip1.type + ',' + ip1.contents);
      console.log('FAIL2');
      drainInputs(this);
      return;
    }
    if (ip0.type == this.IPTypes.NORMAL &&
      ip0.contents.trim().localeCompare(ip1.contents.trim()) != 0) {
      console.log(ip0.type + ',' + ip0.contents);
      console.log(ip1.type + ',' + ip1.contents);
      console.log('FAIL3');
      drainInputs(this);
      return;
    }
    this.dropIP(ip0);
    this.dropIP(ip1);
  }

  function drainInputs(proc) {
    if (ip0 != null) {
      proc.dropIP(ip0);
    }
    ip0 = inportArray[0].receive();
    while (ip0 != null) {
      proc.dropIP(ip0);
      ip0 = inportArray[0].receive();
    }

    if (ip1 != null) {
      proc.dropIP(ip1);
    }
    ip1 = inportArray[1].receive();
    while (ip1 != null) {
      proc.dropIP(ip1);
      ip1 = inportArray[1].receive();
    }
  }
};
