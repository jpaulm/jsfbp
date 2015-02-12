var fbp = require('..');

module.exports = function reverse() {
  var inport = fbp.InputPort.openInputPort('IN');
  var outport = fbp.OutputPort.openOutputPort('OUT');
  while (true) {
    var ip = inport.receive();
    if (ip === null) {
      break;
    }
    var s = ip.contents;
    outport.send(fbp.IP.create(StringReverse(s)));
    fbp.IP.drop(ip);
  }
}

  function StringReverse (str)

  // Thanks to Scott Gartner - Jun 28 '13 -
  //  http://stackoverflow.com/questions/958908/how-do-you-reverse-a-string-in-place-in-javascript
{
  var charArray = [];
  for (var i = 0; i < str.length; i++)
    {
      if (i+1 < str.length)
        {
          var value = str.charCodeAt(i);
          var nextValue = str.charCodeAt(i+1);
          if (   (   value >= 0xD800 && value <= 0xDBFF
                  && (nextValue & 0xFC00) == 0xDC00) // Surrogate pair)
              || (nextValue >= 0x0300 && nextValue <= 0x036F)) // Combining marks
            {
              charArray.unshift(str.substring(i, i+2));
              i++; // Skip the other half
              continue;
            }
        }

      // Otherwise we just have a rogue surrogate marker or a plain old character.
      charArray.unshift(str[i]);
    }

  return charArray.join('');
}

