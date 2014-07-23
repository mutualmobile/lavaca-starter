require.config({
  baseUrl: 'js',
  paths: {
    'es5-shim': '../components/es5-shim/es5-shim',
    '$': '../components/jquery/jquery',
    'jquery': '../components/jquery/jquery',
    'hammer': '../components/hammerjs/dist/jquery.hammer',
    'mout': '../components/mout/src',
    'dust': '../components/dustjs-linkedin/dist/dust-full-2.0.4',
    'dust-helpers': '../components/dustjs-linkedin-helpers/dist/dust-helpers-1.1.1',
    'lavaca-dust-helpers': '../components/lavaca-dust-helpers/src/lavaca-dust-helpers',
    'rdust': '../components/require-dust/require-dust',
    'iScroll': '../components/iscroll/dist/iscroll-lite-min',
    'lavaca': '../components/lavaca/src',
    'i18n': '../components/i18n/i18n'
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
require(['lavaca-dust-helpers']);
require(['app/app']);
