jsfbp
=====

Basic FBP implementation written in JavaScript, using Node-Fibers - https://github.com/laverdet/node-fibers .

General
---

Test cases so far:

- `fbptest1` - 3 processes:
    - `sender` (generates ascending numeric values)
    - `copier` (copies)
    - `recvr`  (displays incoming values to console)

![JSFBP](https://github.com/jpaulm/jsfbp/blob/master/docs/JSFBP.png "Simple Test Network")

- `fbptest2` - `sender` replaced with `reader`
- `fbptest3` - `sender` and `reader` both feeding into `copier.IN`
- `fbptest4` - `sender` feeding `repl` which sends 3 copies of input IP (as specified in network), each copy going to a separate element of array port `OUT`; all 3 copies then feeding into `recvr.IN`
- `fbptest5` - Two copies of `reader` running concurrently, one feeds direct to `rrmerge` input port element 0; other one into `copier` and then into `rrmerge` input port element 1; from `rrmerge.OUT` to `recvr.IN` 
- `fbptest6` - The output streams of the `repl` (in `fbptest4`) are fed to an input array port
- `fbptest7` - Creates a deadlock condition - the status of each Process is displayed
- `fbptest8` - reads text, reverses it twice and outputs it
- `fbptest9` - `copier` in `fbptest1` is replaced with a version of `copier` which terminates prematurely and closes its input port, bringing the network down (ungracefully!)
- `fbptest10` -  `copier` in `fbptest1` is replaced with a non-looping version of `copier`
- `fbptest11` -  Load balancer (`lbal`) feeding 3 instances of a random delay component (`randdelay`)
  
![Fbptest11](https://github.com/jpaulm/jsfbp/blob/master/docs/Fbptest11.png "Diagram of fbptest11 above")

- `fbptest12` -  `reader OUT -> IN copier OUT -> IN writer`
  
- `fbptestws` -  Schematic web socket server (simple Process shown can be replaced by any structure of Processes, provided interfaces are adhered to)
 
![Fbptestws](https://github.com/jpaulm/jsfbp/blob/master/docs/Fbptestws.png "Diagram of fbptestws above")
 
Some of these have tracing set on, depending on what testing was being done when they were promoted!

These tests (except for `fbptestws`) can be run sequentially by running `fbptests.bat`.
 
Components
---

- `concat`  - concatenates all the streams that are sent to its array input port (size determined in network definition) 
- `copier`  - copies its input stream to its output stream
- `copier_closing` - forces close of input port after 20 IPs
- `copier_nonlooper` - same as `copier`, except that it is written as a non-looper
- `lbal`    - load balancer - sends output to output port array element with smallest number of IPs in transit
- `randdelay` - sends incoming IPs to output port after random number of millisecs (between 0 and 400)
- `reader`  - does an asynchronous read on the file specified by its FILE IIP 
- `recvr`   - receives its incoming stream and displays the contents on the console 
- `repl`    - replicates the incoming IPs to the streams specified by an array output port (it does not handle tree structures)
- `reverse` - reverses the string contained in each incoming IP
- `rrmerge` - "round robin" merge 
- `sender`  - sends as many IPs to its output port as are specified by its COUNT IIP (each just contains the current count)
- `writer`  - does an asynchronous write to the file specified by its FILE IIP
  
- `wsrecv`  - general web socket "receive" component for web socket server - outputs substream 
- `wsresp`  - general web socket "respond" component sending data from web socket server to client - takes substream as input
- `wssimproc` - "simulated" processing for web socket server - actually just outputs 3 names

 
API
---
Defining network:
- start with `var fbp = require('./fbp.js');`
- `fbp.defProc` - define Process
- `fbp.connect` - connect output port to input port
- `fbp.initialize` - specify IIP and the port it is connected to
 
- finish with
- `var trace = true;`  or `... false` - specify whether tracing desired
- `fbp.run(trace);`
  
Component services:
- `var ip = IP.create(contents);` - create an IP containing `contents`
- `var ip = IP.createBracket(IP.OPEN|IP.CLOSE[, contents])` - create an open or close bracket IP
- `IP.drop(ip);` - drop IP
  
- `var inport = InputPort.openInputPort('IN');` - create InputPort variable  
- `var array = InputPortArray.openInputPortArray('IN');` - create input array port array
- `var outport = OutputPort.openOutputPort('OUT');` - create OutputPort variable 
- `var array = OutputPortArray.openOutputPortArray('OUT');` - create output array port array   
  
- `var ip = inport.receive();` - returns null if end of stream 
- `var ip = array[i].receive();` - receive to element of port array
- `outport.send(ip);` - returns -1 if send unable to deliver
- `array[i].send(ip);` - send from element of port array
- `inport.close();` - close input port (or array port element)
  
-  `fbp.setCallbackPending(true);` - used when doing asynchronous I/O in component
-  `queueCallback(proc[,data]);` - queue the callback to the JSFBP future events queue
-  `fbp.getElementWithSmallestBacklog(array);` - used by `lbal` - not for general use

Install & Run
---

Install node.js - see http://nodejs.org/download/

Install node-fibers via npm: just do `npm install fibers`.

Create a folder called `jsfbp` in `node/node_modules/fibers`, and download all the JavaScript files from the JSFBP `script` directory into `jsfbp`.

This network can now be run by positioning at this directory, and entering `node fbptestx.js`, where `fbptestx` is any of the tests listed above.  If tracing is desired, change the value of the `trace` variable at the bottom of fbptest.js to `true`.

`chat1.html` is intended as a simple client for testing with the prototype web sockets server network `fbptestws.js`.

Tracing
---

Here is a sample section of the trace output for `fbptest8.js`:
```
Recvr recv from Recvr.IN
Recvr yielded: true, cbpending: false
Recvr fiber yielded
Reverse2 fiber resumed
Reverse2 send OK
Reverse2 IP dropped with:
 si PBF .yllanretni degnahc eb ot gnivah tuohtiw snoitacilppa tnereffid mrof ot
Reverse2 recv from Reverse2.IN
Reverse2 recv OK: .detneiro-tnenopmoc yllarutan suht
Reverse2 Create IP with: thus naturally component-oriented.
Reverse2 send to Reverse2.OUT: thus naturally component-oriented.
Reverse2 yielded: true, cbpending: false
Reverse2 fiber yielded
Recvr fiber resumed
Recvr recv OK: to form different applications without having to be changed inter
nally. FBP is
data: to form different applications without having to be changed internally. FB
P is
Recvr IP dropped with: to form different applications without having to be chang
ed internally. FBP is
Recvr recv from Recvr.IN
Recvr yielded: true, cbpending: false
Recvr fiber yielded
Reverse2 fiber resumed
Reverse2 send OK
Reverse2 IP dropped with: .detneiro-tnenopmoc yllarutan suht
Reverse2 recv from Reverse2.IN
Reverse2 recv EOS from Reverse2.IN
Reverse2 yielded: false, cbpending: false
Reverse2 fiber ended
Reverse2 closing
Reverse2 closed
```

Performance
---

This first test case (Jan. 16, 2015) with 2000 IPs running through three processes takes 200 ms, giving approx. 50 microsecs per send/receive pair.  

