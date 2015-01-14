jsfbp
=====

Baseic FBP impleemntation written in JavaScript, using https://github.com/laverdet/node-fibers .

General
---

Very early feasibility study - will be changing continually over time.

Current test case (in same JS file) has 3 processes:
 - `Sender`
 - `Copier`
 - `Recvr`
 
 All ports in this example are labelled `IN` and `OUT`.  

Objects are `Process` and `Connection`; currently no Port objects (Connections are attached directly to Process instances) - this may change.

Programming concerns
---

Two main 'globals': `processes` (linking Processes to fibers), and `queue` (future events queue).  These should be hidden - packaging suggestions would be welcome.

Performance
---

This first test case (Jan. 13, 2015) with two processes runs at approx. 100 microsecs per send/receive pair.  With 3 processes it runs at 68 microsecs per send/receive pair (connection capacity = 50).
