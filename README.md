jsfbp
=====

Basic FBP implementation written in JavaScript, using Node-Fibers - https://github.com/laverdet/node-fibers .

General
---

Very early feasibility study.

Current test case has 3 processes:
 - `Sender`
 - `Copier`
 - `Recvr`

![JSFBP](https://github.com/jpaulm/jsfbp/blob/master/docs/JSFBP.png "Simple Test Network")

Programming issues
---
Objects are `Process` and `Connection`; currently we don't have any Port objects (Connections are attached directly to Process instances) - this may change.

Performance
---

This first test case (Jan. 16, 2015) with 2000 IPs running through three processes takes 200 ms, giving approx. 50 microsecs per send/receive pair.  

