define(function(require) {

  var ViewTransitionAnimations = require('app/animations/ViewTransitionAnimations');
  require('lavaca/fx/Animation'); //jquery plugins

  return {
    pageTransition: ViewTransitionAnimations.SLIDE,
    rootPageTransition: ViewTransitionAnimations.FADE
  };

});
