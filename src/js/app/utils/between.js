define(function(require) {

  return Number.prototype.between = function (a, b) {
    var min = Math.min.apply(Math, [a,b]),
        max = Math.max.apply(Math, [a,b]);
    return this > min && this < max;
  };

});