require.config({
  baseUrl: 'js',
  paths: {
    'es5-shim': '../components/es5-shim/es5-shim',
    '$': '../components/jquery/index',
    'jquery': '../components/jquery/index',
    'hammer': '../components/hammerjs/plugins/jquery.hammer',
    'cordova': '../components/lavaca/src/js/libs/cordova',
    'mout': '../components/mout/src',
    'docCookies': '../components/lavaca/src/js/libs/docCookies',
    'dust': '../components/dustjs-linkedin/dist/dust-full-2.0.3',
    'dust-helpers': '../components/dustjs-linkedin-helpers/dist/dust-helpers-1.1.1',
    'rdust': '../components/lavaca/src/js/libs/require-dust',
    'iscroll': '../components/iscroll/dist/iscroll-lite-min',
    'lavaca': '../components/lavaca/src/js/lavaca'
  },
  shim: {
    $: {
      exports: '$'
    },
    jquery: {
      exports: '$'
    },
    hammer: {
      deps: ['$'],
      exports: 'Hammer'
    },
    dust: {
      exports: 'dust'
    },
    'dust-helpers': {
      deps: ['dust']
    }
  }
});
require(['es5-shim']);
require(['app/app']);