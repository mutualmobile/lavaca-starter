import 'css/app/app.less';
import 'imports?$=jquery!hammer';

var History = require('lavaca/net/History');
var HomeController = require('app/controllers/HomeController');
var Connectivity = require('lavaca/net/Connectivity');
var Application = require('lavaca/mvc/Application');
var ViewManagerViewMixin = require('app/mixins/ViewManagerViewMixin');
var ViewManagerViewFillin = require('app/mixins/ViewManagerViewFillin');
require('app/env/ModernizrTests');
require('app/utils/hammer_extensions');

// Uncomment this section to use hash-based browser history instead of HTML5 history.
// You should use hash-based history if there's no server-side component supporting your app's routes.
History.overrideStandardsMode();
//History.useHashBang();

// Setup offline AJAX handler
Connectivity.registerOfflineAjaxHandler(function() {
  alert("Offline");
});

/**
 * Global application-specific object
 * @class app  
 * @extends Lavaca.mvc.Application
 */
module.exports = new Application(function() {
  // Add routes
  this.router.add({
    '/': [HomeController, 'index']
  });

  this.viewManager.pageViewMixin = ViewManagerViewMixin;
  this.viewManager.pageViewFillin = ViewManagerViewFillin;
  //this.viewManager.initBreadcrumbTracking();

  // SwipeHistoryBackManager
  // require('app/managers/SwipeHistoryBackManager');
});
