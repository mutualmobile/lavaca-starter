define(function(require) {
  var React = require('react');
    require('lavaca-mixin');
  require('JSXTransformer');
  
  // var History = require('lavaca/net/History');
  // var stateModel = require('app/models/StateModel');
  var HomeController = require('jsx!app/net/HomeController');
  // var Service = require('app/service/Service');
  // var Connectivity = require('lavaca/net/Connectivity');
  var Application = require('lavaca/mvc/Application');
  // var Router = require('lavaca/mvc/Router');
  // var Config = require('app/env/Config');
  // require('lavaca/fx/Transition');
  // require('hammer');
  // require('app/utils/hammer_extensions');
  // require('app/env/ModernizrTests');

  // Uncomment this section to use hash-based browser history instead of HTML5 history.
  // You should use hash-based history if there's no server-side component supporting your app's routes.
  // History.overrideStandardsMode();

  var app = new Application(function() {
    // Add routes
    this.router.add({
      '/': [HomeController, 'index'],
      '/dashboard': [HomeController, 'dashboard']
    });
  });
  return app;
});