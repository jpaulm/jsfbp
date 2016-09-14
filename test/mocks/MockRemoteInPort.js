var ipc = require('node-ipc')
  , fork = require('child_process').fork;


if(process.send) {
  (function (appName, processName, portName) {
    ipc.config.appspace = appName + ".";
    ipc.config.id = processName;

    ipc.serve(
      function () {
        ipc.log('Started Remote Port: ' + portName);
        ipc.server.on(
          'ipAvailable',
          function (data, socket) {
            if (data.for === portName) {
              ipc.server.emit(socket, 'retrieve');
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

module.exports = function (appName, processName, portName, cb) {
  fork(__dirname + '/../mocks/MockRemoteInPort', [appName, processName, portName]).on('message', cb);
};
