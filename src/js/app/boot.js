require.config({
  baseUrl: 'js',
  paths: {
    'react': '../packages/react/react-with-addons',
    'JSXTransformer': '../packages//react/JSXTransformer',
    'jsx': '../packages/requirejs-react-jsx/jsx',
    'text': '../packages/requirejs-text/text',
    'es5-shim': '../packages/es5-shim/es5-shim',
    'es6-shim': '../packages/es6-shim/es6-shim',
    '$': '../packages/jquery/jquery',
    'jquery': '../packages/jquery/jquery',
    'hammer': '../packages/hammerjs/dist/jquery.hammer',
    'mout': '../packages/mout/src',
    'lavaca': '../packages/lavaca/src',
    'i18n': '../packages/i18n/i18n',
    'lodash': '../packages/lodash/lodash',
    'modernizr': '../packages/modernizr/modernizr',
    'lavaca-mixin':'../packages/lavaca/src/LavacaReactMixin'
  },
  shim: {
    'lavaca':{
    },
    $: {
      exports: '$'
    },
    'lodash':{
      exports: '_'
    },
    jquery: {
      exports: '$'
    },
    'react': {
      'exports': 'React'
    },
    'JSXTransformer': 'JSXTransformer'
  },
  waitSeconds: 0
});

require(['app/app']);
