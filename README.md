# jsfbp
[![NPM](https://nodei.co/npm/jsfbp.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jsfbp/)

[![Build Status](https://travis-ci.org/jpaulm/jsfbp.svg?branch=master)](https://travis-ci.org/jpaulm/jsfbp)

"Classical" FBP "green thread" implementation written in JavaScript, using Node-Fibers - https://github.com/laverdet/node-fibers .  

JSFBP takes advantage of JavaScript's concept of functions as first-degree objects to allow applications to be built using "green threads".  JSFBP makes use of an internal "Future Events Queue" which supports the green threads, and provides quite good performance (see below) - the JavaScript events queue is only used for JavaScript asynchronous functions, as before.

# General

Test cases so far:

- `fbptest01` - 3 processes:
    - `gendata` (generates ascending numeric values)
    - `copier` (copies)
    - `recvr`  (displays incoming values to console)

![jsfbp](https://cloud.githubusercontent.com/assets/312871/12333111/52f268b8-bac0-11e5-963d-08061734dc68.png  "Simple Test Network")

- `fbptest02` - `gendata` replaced with `reader`
- `fbptest03` - `gendata` and `reader` both feeding into `copier.IN`
- `fbptest04` - `gendata` feeding `repl` which sends 3 copies of input IP (as specified in network), each copy going to a separate element of array port `OUT`; all 3 copies then feeding into `recvr.IN`
- `fbptest05` - Two copies of `reader` running concurrently, one feeds direct to `rrmerge` ("round robin" merge) input port element 0; other one into `copier` and then into `rrmerge` input port element 1; from `rrmerge.OUT` to `recvr.IN` 
- `fbptest06` - The output streams of the `repl` (in `fbptest04`) are fed to the input array port of `rrmerge`, and from its `OUT` to `recvr.IN`
- `fbptest07` - Creates a deadlock condition - the status of each Process is displayed
- `fbptest08` - reads text, reverses it twice and outputs it
- `fbptest09` - `copier` in `fbptest01` is replaced with a version of `copier` which terminates prematurely and closes its input port, bringing the network down (ungracefully!)
- `fbptest10` -  `copier` in `fbptest01` is replaced with a non-looping version of `copier`
- `fbptest11` -  Load balancer (`lbal`) feeding 3 instances of a random delay component (`randdelay`)
  
![fbptest11](https://cloud.githubusercontent.com/assets/312871/12333117/5ae111a0-bac0-11e5-8167-0bb4bfb24f25.png  "Diagram of fbptest11 above")

- `fbptest12` -  `reader OUT -> IN copier OUT -> IN writer`
- `fbptest13` -  Simple network to demonstrate functioning of random delay component (`randdelay`)
- `fbptest14` -  Network demonstrating parallelism using two instances of `reader` and two fixed delay components (`delay`)
- `fbptestvl` -  Volume test (see below): `gendata` -> `copier` -> `discard`  
-  `testsubstreamsensitivesplitting.js` - Test substream-sensitive logic in `lbal`, feeding `substreamsensitivemerge.js`

"Update" networks
----------
- `update`    -  "Update" run, demonstrating use of `collate.js` 
- `update_c`  -  Same as `update.js` but routing output to a `compare` process, rather than to `display`
  
The following diagram shows `update` and `update_c` in one diagram using the DrawFBP Enclosure function - this is not really a valid DrawFBP diagram, so no port names are shown:

![update_combined](https://cloud.githubusercontent.com/assets/312871/12332149/efc37f52-baba-11e5-8775-d1516a0cc568.png "Diagram showing update.js and update_c.js")

Here is `update_c` by itself, with component and port names marked in - it contains all the information needed to generate a running JSFBP network (the file and report icons do not generate any code):

![update_c](https://cloud.githubusercontent.com/assets/312871/12379403/ffb3d6ea-bd27-11e5-9f56-1a8e4758dc1d.png "Diagram showing update_c.js")
 
WebSockets
----

- `fbptestws` -  Schematic web socket server (simple Process shown can be replaced by any structure of Processes, provided interfaces are adhered to)

![fbptestws](https://cloud.githubusercontent.com/assets/312871/12344772/0433b4a8-bb0f-11e5-8084-082b9a7b9c22.png "Diagram of fbptestws above")
 
Some of these have tracing set on, depending on what testing was being done when they were promoted!

These tests (except for `fbptestws`) can be run sequentially by running `fbptests.bat`.
 
# Components

- `breader` - reads from a binary file specified by FILE IIP and sends one IP per byte in the file. Starts sending IPs as soon as first byte is read.
- `bwriter` - takes a stream of IPs containing bytes and writes them to a file from its FILE IIP. Starts writing as soon as the first IP comes in.
- `collate` - collates from 1 to any number of sorted input streams, generating merged stream with bracket IPs inserted (sort fields assumed to be contiguous starting at 1st byte; all streams assumed to be sorted on same fields, in ascending sequence) 
- `concat`  - concatenates all the streams that are sent to its array input port (size determined in network definition) 
- `copier`  - copies its input stream to its output stream
- `copier_closing` - forces close of input port after 20 IPs
- `copier_nonlooper` - same as `copier`, except that it is written as a non-looper (it has been modified to call the FBP services from lower in the process's stack)
- `discard` - discard (drop) all incoming IPs
- `display` - display all incoming IPs, including bracket IPs
- `gendata`  - sends as many IPs to its output port as are specified by its COUNT IIP (each just contains the current count)
- `lbal`    - load balancer - sends output to output port array element with smallest number of IPs in transit
- `randdelay` - sends incoming IPs to output port after random number of millisecs (between 0 and 400)
- `reader`  - does an asynchronous read on the file specified by its FILE IIP 
- `recvr`   - receives its incoming stream and displays the contents on the console 
- `repl`    - replicates the incoming IPs to the streams specified by an array output port (it does not handle tree structures)
- `reverse` - reverses the string contained in each incoming IP
- `rrmerge` - "round robin" merge 
- `substreamsensitivemerge.js` - merges multiple input streams, but keeps IPs in correct sequence within each substream, although sequence of substreams is not guaranteed
- `writer`  - does an asynchronous write to the file specified by its FILE IIP

- `wsrecv`  - general web socket "receive" component for web socket server - outputs substream 
- `wsresp`  - general web socket "respond" component sending data from web socket server to client - takes substream as input
- `wssimproc` - "simulated" processing for web socket server - actually just outputs 3 names

 
# API

## For application developers

Networks can be generated programmatically or by loading in an FBP file.

### Programmatically

1. Get access to JSFBP: `var fbp = require('fbp')`
2. Create a new network: `var network = new fbp.Network();`
3. Define your network:
 - Add processes: `network.defProc(...)`  Note: when several processes use the same component, `defProc` takes the process name as a second argument. 
 - Connect output ports to input ports: `network.connect(...)`
 - Specify IIPs: `network.initialize(...)`
4. Create a new runtime: `var fiberRuntime = new fbp.FiberRuntime();`
5. Run it!
 
```
network.run(fiberRuntime, {trace: true/false}, function success() {
    console.log("Finished!");
  });
```

### Via an FBP file

1. Generate an `.fbp` file that complies with the specification under [parsefbp](https://github.com/jpaulm/parsefbp).
2. Get access to JSFBP: `var fbp = require('fbp')`
3. Load the contents of the `.fbp` file into a String: `fs.readFile(__dirname + '/network.fbp' ...);`
4. Create a new network: `var network = new fbp.Network.createFromGraph(fileContents);` If you're using components
   that are local to your application, use a second parameter giving the directory that contains your components. 
5. Create a new runtime: `var fiberRuntime = new fbp.FiberRuntime();`
6. Run it!
```
network.run(fiberRuntime, {trace: true/false}, function success() {
    console.log("Finished!");
  });
```


 Activating `trace` can be desired in debugging scenarios.

 ### Useful methods
 
- `Network#defProc(component[, name])` Creates a process from a component, defined by the first parameter.
  
  - The first parameter can be a function or a string. When a string is used, the component is loaded according to three
  possiblities:
    - If the component string starts `'./'` then the component is assumed to be one of he JSFBP components and is loaded.
  For example: `'./components/copier.js'`
    - If the component string starts with `'/'` then the component is assumed to be local to the application. If your network has
    local components, then the network needs to have been instantiated with a `{ componentRoot: 'dir' }` object so that
    it knows where to find the components.
    - If the component string contains a `/`, then it assumed to be of the form `'package/component'`. Thus `package` is loaded
  and then `component` is retrieved from it. If `package` is `'jsfbp'`, then it is loaded from the JSFBP `components` directory.
    - Otherwise, the string is assumed to be a node module that _is_ an FBP component and it is simply
  loaded via `require`.
  
  - The second paramter is an optional name for the Process. If not provided, it will be inferred from the `component`.

## For component developers

Component headers:
`'use strict';`

In most cases you do not need to *require()* any JSFBP-related scripts or libraries as a component developer. Everything you need is injected into the component's function as its context `this` (the process object) and as a parameter (the runtime object).
Some utility functions are stored in `core/utils.js`. Import them if you really need them.
You should generally refrain from accessing runtime-related code (e.g. Fibers) to ensure the greatest compatibility.

Component services

- In what follows, the `this` is only valid if the function is called from the component level; if called from a subroutine, pass in `this` as a parameter.

- `var ip = this.createIP(contents);` - create an IP containing `contents`
- `var ip = this.createIPBracket(this.IPTypes.OPEN|this.IPTypes.CLOSE[, contents])` - create an open or close bracket IP
- **Be sure** to include IP: `var IP = require('IP')` to gain access to the IP constants.
- `this.dropIP(ip);` - drop IP
  
- `var inport = this.openInputPort('IN');` - create InputPort variable  
- `var array = this.openInputPortArray('IN');` - create input array port array
- `var outport = this.openOutputPort('OUT');` - create OutputPort variable 
- `var array = this.openOutputPortArray('OUT');` - create output array port array   
  
- `var ip = inport.receive();` - returns null if end of stream 
- `var ip = array[i].receive();` - receive to element of port array
- `outport.send(ip);` - returns -1 if send unable to deliver
- `array[i].send(ip);` - send from element of port array
- `inport.close();` - close input port (or array port element)
  
-  `runtime.runAsyncCallback()` - used when doing asynchronous I/O in component; when using this function, include `runtime` in component header, e.g. `module.exports = function xxx(runtime) { ...` 
   
  Example:
```
runtime.runAsyncCallback(function (done) {
  // your asynchronous
  ...
  // call done (possibly asynchronously) when you're done!
  done();
});
```
-  `Utils.getElementWithSmallestBacklog(array);` - used by `lbal` - not for general use 
- **Be sure** to include Utils: `var Utils = require('core/utils')`.
 
-  `Utils.findInputPortElementWithData(array);` - used by `substreamsensitivemerge` - not for general use 
- **Be sure** to include Utils: `var Utils = require('core/utils')`.

# Install & Run

We use `node-fibers` which is known to work with `Node.js 12.7` (as of 24.07.2015).

1. Install node.js - see http://nodejs.org/download/  . 
2. Clone or download this project
3. Execute `npm install`
   Install requires the following `npm` packages: `parsefbp`, `fibers`, `mocha`, `chai`, `lodash` and `mocha-fibers` - you may have to do `npm` installs for some or all of these.
   
   If you get an MSB4019 or similar error messages involving `utf-8-validate` and `bufferutil` (some dependencies deep down the dependency tree), you can just ignore them, given the optional nature of these components' compilation.

3b. JSFBP is now on `npm`, so you can simply do `npm install jsfbp`.  

4. Run `node examples/fbptestxx.js`, where `fbptestxx` is any of the tests listed above. If tracing is desired, change the value of the `trace` variable at the bottom of `fbptestxx.js` to `true`. 
5. All these tests can be run sequentially by running `examples/fbptests.bat`, or by running `examples/fbptests.sh` under `bash`.

*Important* - BitDefender Antivirus 2016 anti-ransomware feature seems to interfere with `git`- we suggest you leave it turned off while working with `git`.

## Full install

If you wish to eliminate the errors mentioned in point #3 under *Install*, you will need to install Python 2.x and Visual Studio Express for Desktop 2013. This doesn't seem to guarantee an error-free `npm install`, however.  Still `jsfbp` works fine, even with these errors.

1. Install node.js - see http://nodejs.org/download/  . 
2. Install Python 2.x
3. Install Visual Studio Express for Desktop 2013 (click on http://go.microsoft.com/fwlink/?LinkId=532500&clcid=0x409 )
4. Clone or download this project
5. Open a _new_ shell (The shell should not have been opened from before the Visual Studio installation because then the PATH and other environment variables are not yet updated.)
6. Optionally prepend Python 2.x to your PATH if you haven't already done so
        -  e.g. `SET PATH=C:\path\to\python2-directory\;%PATH%`
7. Execute `npm install`
8. Run `node examples/fbptestxx.js`, where `fbptestxx` is any of the tests listed above. If tracing is desired, change the value of the `trace` variable at the bottom of `fbptestxx.js` to `true`. 
9. Install requires the following `npm` packages: `parsefbp`, `fibers`, `mocha`, `chai`, `lodash` and `mocha-fibers` - you may have to do `npm` installs for some or all of these.
10. All these tests can be run sequentially by running `examples/fbptests.bat`, or by running `examples/fbptests.sh` under `bash`.

*Important* - BitDefender Antivirus 2016 anti-ransomware feature seems to interfere with `git`- we suggest you leave it turned off while working with `git`.

# Testing with Mocha

The folder called `test` contains a number of Mocha tests.

1. Run `npm test` to execute a series of tests (all the `fbptestxx.js` tests in sequence).
2. Alternatively, you can directly execute `node.exe node_modules/mocha/bin/mocha --recursive --require test/test_helper.js` in case you need to adjust the path to Node's binary or pass further parameters to Mocha.

# Testing Sample HTTP Server

Run `node examples/httpserver/fbphttpserver.js`, which is a simple HTTP server which is similar to the one in the sample at: http://blog.modulus.io/build-your-first-http-server-in-nodejs

NOTE: The HTTP server components are currently all custom components, based on the components used in the simple web socket chat server described below.

# Testing Simple Web Socket Chat Server

Run `node examples/websocketchat/fbptestwschat.js`, which is a simple web socket chat server which responds to any request by broadcasting it to all connected clients. It is similar to the chat sample at: http://socket.io/get-started/chat/ except for serving the client HTML.

`examples/websocketchat/index.html` is intended as a simple chat client for testing with `fbptestwschat.js`. If Firefox doesn't work for you, Chrome and Safari will work.

Just enter any string into the input field, and click on `Send`, and it will broadcast it to all clients that are connected.

Click on the `Stop WS` button, and the network will come down.

Tracing
---

Here is a sample section of the trace output for `fbptest08.js`:
```
recvr recv OK: externally to the processes. These black box processes can be rec
onnected endlessly
data: externally to the processes. These black box processes can be reconnected
endlessly
recvr IP dropped with: externally to the processes. These black box processes ca
n be reconnected endlessly
recvr recv from recvr.IN
Yield/return: state of future events queue:
- reverse2 - status: ACTIVE
---
---
reverse2 send OK
reverse2 IP dropped with:  si PBF .yllanretni degnahc eb ot gnivah tuohtiw snoit
acilppa tnereffid mrof ot
reverse2 recv from reverse2.IN
reverse2 recv OK: .detneiro-tnenopmoc yllarutan suht
reverse2 send to reverse2.OUT: thus naturally component-oriented.
Yield/return: state of future events queue:
- recvr - status: ACTIVE
---
---
recvr recv OK: to form different applications without having to be changed inter
nally. FBP is
```

Performance
---

The volume test case (`fbptestvl`) with 100,000,000 IPs running through three processes took 164 seconds, on my machine 
which has 4 AMD Phenom(tm) II X4 925 processors.  

Since there are two connections, giving a total of 200,000,000 send/receive pairs, this works out to approx. 
0.82 microsecs per send/receive pair. Of course, as it is JavaScript, this test only uses 1 core intensively, 
although there is some matching activity on the other cores (why...?!)

