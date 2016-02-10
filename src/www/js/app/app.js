import 'css/app/app.less';
import 'imports?$=jquery!hammer';

var History = require('lavaca/net/History');
var HomeController = require('app/net/HomeController');
var Connectivity = require('lavaca/net/Connectivity');
var Application = require('lavaca/mvc/Application');

// Uncomment this section to use hash-based browser history instead of HTML5 history.
// You should use hash-based history if there's no server-side component supporting your app's routes.
History.overrideStandardsMode();

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
});
