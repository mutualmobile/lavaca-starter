var HomeView = require('app/ui/views/pageviews/HomeView'),
    BaseController = require('app/net/BaseController'),
    Model = require('lavaca/mvc/Model');

/**
 * Home controller
 * @class app.net.HomeController
 * @extends app.net.BaseController
 */ 
var HomeController = BaseController.extend({
  /**
   * Home action, creates a history state and shows a view
   * @method home
   *
   * @param {Object} params  Action arguments
   * @param {Object} history  History state model
   * @return {Lavaca.util.Promise}  A promise
   */
  index: function(params, history) {
    var model = new Model();
    return this
      .view(null, HomeView, model)
      .then(this.updateState(history, 'Home Page', params.url));
  }
});

module.exports = HomeController;
