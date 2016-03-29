import {Config} from 'app/env/Config';

let Tests = {};
Tests.agent = navigator.userAgent.toLowerCase();
Tests.otherBrowser = (Tests.agent.search(/series60/i) > -1) || (Tests.agent.search(/symbian/i) > -1) || (Tests.agent.search(/windows\sce/i) > -1) || (Tests.agent.search(/blackberry/i) > -1);
Tests.mobileOS = typeof orientation !== 'undefined';
Tests.blackberry = Tests.agent.search(/blackberry/i) > -1;
Tests.ipad = Tests.agent.search(/ipad/i) > -1;
Tests.ipod = Tests.agent.search(/ipod/i) > -1;
Tests.iphone = Tests.agent.search(/iphone/i) > -1;
Tests.palm = Tests.agent.search(/palm/i) > -1;
Tests.symbian = Tests.agent.search(/symbian/i) > -1;
Tests.nexus7 = Tests.agent.search(/Nexus 7/i) > -1;
Tests.msie = Tests.agent.search(/MSIE/i) > -1;
Tests.msie9 = Tests.msie && Tests.agent.search(/rv:9|MSIE 9/i) > -1;
Tests.msie10 = Tests.msie && Tests.agent.search(/rv:10|MSIE 10/i) > -1;
Tests.msie11 = Tests.msie && Tests.agent.search(/rv:11|MSIE 11/i) > -1;
Tests.iOS = Tests.iphone || Tests.ipod || Tests.ipad;
Tests.iOS5 = Tests.iOS && Tests.agent.search(/os 5_/i) > 0;
Tests.iOSChrome = Tests.iOS && Tests.agent.search(/CriOS/i) > 0;
Tests.android = (Tests.agent.search(/android/i) > -1) || (!Tests.iOS && !Tests.otherBrowser && Tests.mobileOS);
Tests.android2 = Tests.android && (Tests.agent.search(/android\s2/i) > -1);
Tests.isMobile = Tests.android || Tests.iOS || Tests.mobileOS;
Tests.macintosh = Tests.agent.search(/macintosh/i) > -1;
Tests.desktop = !Tests.isMobile && (!window.cordova ? true : false) && !Tests.iOS;
Tests.animation = typeof document.documentElement.animate === 'function';
Tests.android23AndBelow = (function() {
  var matches = Tests.agent.match(/android\s(\d)\.(\d)/i);
  var vi, vd;
  if (Array.isArray(matches) && matches.length === 3) {
    vi = parseInt(matches[1], 10);
    vd = parseInt(matches[2], 10);
    return (vi === 2 && vd < 3) || vi < 2;
  }
  return false;
}());
Tests.androidBelow5 = (function() {
  var matches = Tests.agent.match(/android\s(\d)\.(\d)/i);
  var vi, vd;
  if (Array.isArray(matches) && matches.length === 3) {
    vi = parseInt(matches[1], 10);
    vd = parseInt(matches[2], 10);
    return vi < 5;
  }
  return false;
}());
Tests.iOS4AndBelow = (function() {
  var matches = Tests.agent.match(/os\s(\d)_/i);
  var v;
  if (Array.isArray(matches) && matches.length === 2) {
    v = parseInt(matches[1], 10);
    return v <= 4;
  }
  return false;
}());
Tests.iOS7AndBelow = (function() {
  var matches = Tests.agent.match(/os\s(\d)_/i);
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

  window.Modernizr.setTest('animation', Tests.animation);
  window.Modernizr.setTest('android', Tests.android);
  window.Modernizr.setTest('ios', Tests.iOS);
  window.Modernizr.setTest('ipad', Tests.ipad);
  window.Modernizr.setTest('nexus7', Tests.nexus7);
  window.Modernizr.setTest('msie', Tests.msie);
  window.Modernizr.setTest('msie9', Tests.msie9);
  window.Modernizr.setTest('msie10', Tests.msie10);
  window.Modernizr.setTest('msie11', Tests.msie11);
  window.Modernizr.setTest('macintosh', Tests.macintosh);
  window.Modernizr.setTest('desktop', Tests.desktop);
  window.Modernizr.setTest('mobile-browser', (Tests.isMobile && (!window.cordova ? true : false)));
  window.Modernizr.setTest('mobile-app', Tests.isMobile && ((window.cordova) ? true : false) );
  window.Modernizr.setTest('ios-installed', (Tests.iOS && (window.cordova ? true : false)));
  window.Modernizr.setTest('android-installed', (Tests.android && (window.cordova ? true : false)));
  window.Modernizr.setTest('cordova', (window.cordova ? true : false));
  window.Modernizr.setTest('debugging', (Config.debugging));   
}

export let ModernizrTests = Tests;


