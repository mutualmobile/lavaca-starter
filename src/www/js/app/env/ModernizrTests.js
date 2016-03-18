define(function(require) {

  var ModernizrTests = {},
      Config = require('app/env/Config'),
      $ = require('$');

  ModernizrTests.agent = navigator.userAgent.toLowerCase();
  ModernizrTests.otherBrowser = (ModernizrTests.agent.search(/series60/i) > -1) || (ModernizrTests.agent.search(/symbian/i) > -1) || (ModernizrTests.agent.search(/windows\sce/i) > -1) || (ModernizrTests.agent.search(/blackberry/i) > -1);
  ModernizrTests.mobileOS = typeof orientation !== 'undefined';
  ModernizrTests.blackberry = ModernizrTests.agent.search(/blackberry/i) > -1;
  ModernizrTests.ipad = ModernizrTests.agent.search(/ipad/i) > -1;
  ModernizrTests.ipod = ModernizrTests.agent.search(/ipod/i) > -1;
  ModernizrTests.iphone = ModernizrTests.agent.search(/iphone/i) > -1;
  ModernizrTests.palm = ModernizrTests.agent.search(/palm/i) > -1;
  ModernizrTests.symbian = ModernizrTests.agent.search(/symbian/i) > -1;
  ModernizrTests.nexus7 = ModernizrTests.agent.search(/Nexus 7/i) > -1;
  ModernizrTests.msie = ModernizrTests.agent.search(/MSIE/i) > -1;
  ModernizrTests.msie9 = ModernizrTests.msie && ModernizrTests.agent.search(/rv:9|MSIE 9/i) > -1;
  ModernizrTests.msie10 = ModernizrTests.msie && ModernizrTests.agent.search(/rv:10|MSIE 10/i) > -1;
  ModernizrTests.msie11 = ModernizrTests.msie && ModernizrTests.agent.search(/rv:11|MSIE 11/i) > -1;
  ModernizrTests.iOS = ModernizrTests.iphone || ModernizrTests.ipod || ModernizrTests.ipad;
  ModernizrTests.iOS5 = ModernizrTests.iOS && ModernizrTests.agent.search(/os 5_/i) > 0;
  ModernizrTests.iOSChrome = ModernizrTests.iOS && ModernizrTests.agent.search(/CriOS/i) > 0;
  ModernizrTests.android = (ModernizrTests.agent.search(/android/i) > -1) || (!ModernizrTests.iOS && !ModernizrTests.otherBrowser && ModernizrTests.mobileOS);
  ModernizrTests.android2 = ModernizrTests.android && (ModernizrTests.agent.search(/android\s2/i) > -1);
  ModernizrTests.isMobile = ModernizrTests.android || ModernizrTests.iOS || ModernizrTests.mobileOS;
  ModernizrTests.macintosh = ModernizrTests.agent.search(/macintosh/i) > -1;
  ModernizrTests.desktop = !ModernizrTests.isMobile && (!window.cordova ? true : false) && !ModernizrTests.iOS;
  ModernizrTests.animation = typeof document.documentElement.animate === 'function';
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
  ModernizrTests.androidBelow5 = (function() {
    var matches = ModernizrTests.agent.match(/android\s(\d)\.(\d)/i);
    var vi, vd;
    if (Array.isArray(matches) && matches.length === 3) {
      vi = parseInt(matches[1], 10);
      vd = parseInt(matches[2], 10);
      return vi < 5;
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
  ModernizrTests.iOS7AndBelow = (function() {
    var matches = ModernizrTests.agent.match(/os\s(\d)_/i);
    var v;
    if (Array.isArray(matches) && matches.length === 2) {
      v = parseInt(matches[1], 10);
      return v <= 7;
    }
    return false;
  }());

  if (window.Modernizr) {
    window.Modernizr.setTest = function(feature, test) {
      feature = feature.toLowerCase();
      test = typeof test === 'function' ? test() : test;
      if (window.Modernizr.hasOwnProperty(feature)) {
        if (window.Modernizr[feature] && !test) {
          $('html').removeClass(feature).addClass('no-'+feature);
        } else if (!window.Modernizr[feature] && test) {
          $('html').removeClass('no-'+feature).addClass(feature);
        }
        window.Modernizr[feature] = test;
      } else {
        window.Modernizr.addTest(feature, test);
      }
      return window.Modernizr;
    };

    window.Modernizr.setTest('animation', ModernizrTests.animation);
    window.Modernizr.setTest('android', ModernizrTests.android);
    window.Modernizr.setTest('ios', ModernizrTests.iOS);
    window.Modernizr.setTest('ipad', ModernizrTests.ipad);
    window.Modernizr.setTest('nexus7', ModernizrTests.nexus7);
    window.Modernizr.setTest('msie', ModernizrTests.msie);
    window.Modernizr.setTest('msie9', ModernizrTests.msie9);
    window.Modernizr.setTest('msie10', ModernizrTests.msie10);
    window.Modernizr.setTest('msie11', ModernizrTests.msie11);
    window.Modernizr.setTest('macintosh', ModernizrTests.macintosh);
    window.Modernizr.setTest('desktop', ModernizrTests.desktop);
    window.Modernizr.setTest('mobile-browser', (ModernizrTests.isMobile && (!window.cordova ? true : false)));
    window.Modernizr.setTest('mobile-app', ModernizrTests.isMobile && ((window.cordova) ? true : false) );
    window.Modernizr.setTest('ios-installed', (ModernizrTests.iOS && (window.cordova ? true : false)));
    window.Modernizr.setTest('android-installed', (ModernizrTests.android && (window.cordova ? true : false)));
    window.Modernizr.setTest('cordova', (window.cordova ? true : false));
    window.Modernizr.setTest('debugging', (Config.debugging));   
  }

  return ModernizrTests;

});
