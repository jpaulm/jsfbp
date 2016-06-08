'use strict';

module.exports = function reverse() {
  var inport = this.openInputPort('IN');
  var outport = this.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var s = ip.contents;
    outport.send(this.createIP(reverseString(s)));
    this.dropIP(ip);
  }
};

// Thanks to Scott Gartner
// Link to answer on StackOverflow: http://stackoverflow.com/a/17374133
// Link to user profile page of Scott Gartner: http://stackoverflow.com/users/324657/scott-gartner
// License: CC BY-SA 3.0 with attribution required: http://creativecommons.org/licenses/by-sa/3.0/
function reverseString(str) {
  var charArray = [];
  for (var i = 0; i < str.length; i++) {
    if (i + 1 < str.length) {
      var value = str.charCodeAt(i);
      var nextValue = str.charCodeAt(i + 1);
      if ((value >= 0xD800 && value <= 0xDBFF &&
          (nextValue & 0xFC00) == 0xDC00) // Surrogate pair
        ||
        (nextValue >= 0x0300 && nextValue <= 0x036F)) // Combining marks
      {
        charArray.unshift(str.substring(i, i + 2));
        i++; // Skip the other half
        continue;
      }
    }

    // Otherwise we just have a rogue surrogate marker or a plain old character.
    charArray.unshift(str[i]);
  }

  return charArray.join('');
}
