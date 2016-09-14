var ipc = require('node-ipc')
  , fork = require('child_process').fork;


if(process.send) {
  (function (networkName, processName, portName) {
    ipc.config.appspace = networkName + ".";
    ipc.config.id = processName+"."+portName;

    ipc.serve(
      function () {
        ipc.log('Started Remote Port: ' + portName);
        ipc.server.on(
          'retrieve',
          function (data, socket) {
            if (data.for === portName) {
              ipc.server.emit(socket, 'sendIP');
            } else {
              throw new Error("Informed of IP for an unknown port: " + data.for);
            }
          }
        );
        process.send('ready');
      }
    );
    ipc.server.start();
  }).apply(null, process.argv.slice(2));
}

module.exports = function (networkName, processName, portName, cb) {
  fork(__dirname + '/../mocks/MockRemoteOutPort', [networkName, processName, portName]).on('go', cb);
};
