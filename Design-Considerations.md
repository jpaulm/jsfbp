# Design Considerations

This doc is a list of assumptions, assertions and whatnot about how this framework
is put together.

It's really for developers of `jsfbp` to review and maintain and it may have
a short life, once the implementation stabilizes.

## Domain Objects

`jsfbp` is made up of

* Networks
* Processes
* Components
* Ports
  * InputPorts
  * OutputPorts
* IPs

There are some other objects along the way, but these are the main ones.

## Overview

A `Network` is created. It is made up of `Process` objects that are made up
of a `Component` object and multiple `Port` objects.

Application code is run via the `Component`. These objects run in their own thread
to provide the necessary asynchronicity that allows `IP` flow through the `Network`.

In addition, each `Process` object runs within its own OS process.

### Component

Application code runs within the context of a Component. That is to say, `this` within the
application code will always refer to the `Component`.

Application code can be written with no concern for the asyncronicity of the `Component`. To achieve
this, calls that require waiting for the delivery or receipt of an IP are blocking calls.

Async calls to other subsystems (such as the filesystem) must be wrapped, on order that
they become synchronous (within the context of a Component).

Oh boy... I need to rewrite that.


