var sync = require('synchronize');

var RuntimeScaffold = function () {};

RuntimeScaffold.prototype.runAsyncCallback = function (asyncFn) {
  var caller = function (cb) {
    asyncFn(function(results) {
      cb(null, results);
    })
  };

  return sync.await(caller(sync.defer()))
};

module.exports = RuntimeScaffold;