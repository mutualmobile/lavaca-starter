define(function() {
  // http://stackoverflow.com/a/15710692/2563213
  return function(s){
    if (!s) {
      return '';
    }
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
  };
});