define(function(require) {

  var ModernizrTests = {},
      Config = require('app/env/Config');
  ModernizrTests.agent = navigator.userAgent.toLowerCase();
  ModernizrTests.scrWidth = screen.width;
  ModernizrTests.scrHeight = screen.height;
  ModernizrTests.viewportWidth = window.innerWidth;
  ModernizrTests.viewportHeight = window.innerHeight;
  ModernizrTests.elemWidth = document.documentElement.clientWidth;
  ModernizrTests.elemHeight = document.documentElement.clientHeight;
  ModernizrTests.otherBrowser = (ModernizrTests.agent.search(/series60/i) > -1) || (ModernizrTests.agent.search(/symbian/i) > -1) || (ModernizrTests.agent.search(/windows\sce/i) > -1) || (ModernizrTests.agent.search(/blackberry/i) > -1);
  ModernizrTests.mobileOS = typeof orientation !== 'undefined';
  ModernizrTests.touchOS = 'ontouchstart' in document.documentElement;
  ModernizrTests.blackberry = ModernizrTests.agent.search(/blackberry/i) > -1;
  ModernizrTests.ipad = ModernizrTests.agent.search(/ipad/i) > -1;
  ModernizrTests.ipod = ModernizrTests.agent.search(/ipod/i) > -1;
  ModernizrTests.iphone = ModernizrTests.agent.search(/iphone/i) > -1;
  ModernizrTests.palm = ModernizrTests.agent.search(/palm/i) > -1;
  ModernizrTests.symbian = ModernizrTests.agent.search(/symbian/i) > -1;
  ModernizrTests.iOS = ModernizrTests.iphone || ModernizrTests.ipod || ModernizrTests.ipad;
  ModernizrTests.iOS5 = ModernizrTests.iOS && ModernizrTests.agent.search(/os 5_/i) > 0;
  ModernizrTests.iOSChrome = ModernizrTests.iOS && ModernizrTests.agent.search(/CriOS/i) > 0;
  ModernizrTests.android = (ModernizrTests.agent.search(/android/i) > -1) || (!ModernizrTests.iOS && !ModernizrTests.otherBrowser && ModernizrTests.touchOS && ModernizrTests.mobileOS);
  ModernizrTests.android2 = ModernizrTests.android && (ModernizrTests.agent.search(/android\s2/i) > -1);
  ModernizrTests.isMobile = ModernizrTests.android || ModernizrTests.iOS || ModernizrTests.mobileOS || ModernizrTests.touchOS;
  ModernizrTests.android23AndBelow = (function() {
    var matches = ModernizrTests.agent.match(/android\s(\d)\.(\d)/i);
    var vi, vd;
    if (Array.isArray(matches) && matches.length === 3) {
      vi = parseInt(matches[1], 10);
      vd = parseInt(matches[2], 10);
      return (vi === 2 && vd < 3) || vi < 2;
    }
    return false;
  }());
  ModernizrTests.iOS4AndBelow = (function() {
    var matches = ModernizrTests.agent.match(/os\s(\d)_/i);
    var v;
    if (Array.isArray(matches) && matches.length === 2) {
      v = parseInt(matches[1], 10);
      return v <= 4;
    }
    return false;
  }());

  Modernizr.setTest = function(feature, test) {
    feature = feature.toLowerCase();
    test = typeof test == 'function' ? test() : test;
    if (Modernizr.hasOwnProperty(feature)) {
      if (Modernizr[feature] && !test) {
        $('html').removeClass(feature).addClass('no-'+feature);
      } else if (!Modernizr[feature] && test) {
        $('html').removeClass('no-'+feature).addClass(feature);
      }
      Modernizr[feature] = test;
    } else {
      Modernizr.addTest(feature, test);
    }
    return Modernizr;
  };

  Modernizr.setTest('android', ModernizrTests.android);
  Modernizr.setTest('ios', ModernizrTests.iOS);
  Modernizr.setTest('desktop', (!ModernizrTests.isMobile && (!window.cordova ? true : false)));
  Modernizr.setTest('mobile-browser', (ModernizrTests.isMobile && (!window.cordova ? true : false)));
  Modernizr.setTest('ios-installed', (ModernizrTests.iOS && (window.cordova ? true : false)));
  Modernizr.setTest('android-installed', (ModernizrTests.android && (window.cordova ? true : false)));
  Modernizr.setTest('cordova', (window.cordova ? true : false));
  Modernizr.setTest('debugging', (Config.debugging));
  Modernizr.setTest('landscape', (ModernizrTests.viewportWidth > ModernizrTests.viewportHeight));
  Modernizr.setTest('tablet', (ModernizrTests.viewportWidth > ModernizrTests.viewportHeight && ModernizrTests.viewportWidth > 800)
                              || (ModernizrTests.viewportWidth < ModernizrTests.viewportHeight && ModernizrTests.viewportHeight > 800));
  Modernizr.setTest('tabletportrait650', Modernizr.tablet && ModernizrTests.viewportWidth < 650
                              || Modernizr.tablet && ModernizrTests.viewportHeight < 650);
    

  return ModernizrTests;

});