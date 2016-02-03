var History = require('lavaca/net/History');
var HomeController = require('app/net/HomeController');
var Connectivity = require('lavaca/net/Connectivity');
var Application = require('lavaca/mvc/Application');
// require('hammer');


// Uncomment this section to use hash-based browser history instead of HTML5 history.
// You should use hash-based history if there's no server-side component supporting your app's routes.
History.overrideStandardsMode();

/**
 * Global application-specific object
 * @class app  
 * @extends Lavaca.mvc.Application
 */
var app = new Application(function() {
  // Add routes
  this.router.add({
    '/': [HomeController, 'index']
  });
});

// Setup offline AJAX handler
Connectivity.registerOfflineAjaxHandler(function() {
  alert("Offline");
});

module.exports = app;
