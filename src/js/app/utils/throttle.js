define(function(require) {

  var throttle = function(fn, delay) {
      var context, timeout, result, args,
          cur, diff, prev = 0;
      function delayed(){
          prev = (new Date()).getTime();
          timeout = null;
          result = fn.apply(context, args);
      }
      function throttled(){
          context = this;
          args = arguments;
          cur = (new Date()).getTime();
          diff = delay - (cur - prev);
          if (diff <= 0) {
              clearTimeout(timeout);
              prev = cur;
              result = fn.apply(context, args);
          } else if (! timeout) {
              timeout = setTimeout(delayed, diff);
          }
          return result;
      }
      return throttled;
  };

});
