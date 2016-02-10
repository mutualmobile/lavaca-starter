var HomeView = require('app/ui/views/pageviews/HomeView'),
    BaseController = require('app/net/BaseController'),
    Model = require('lavaca/mvc/Model');

/**
 * Home controller
 * @class app.net.HomeController
 * @extends app.net.BaseController
 */ 
module.exports = BaseController.extend({
  /**
   * Home action, creates a history state and shows a view
   * @method home
   *
   * @param {Object} params  Action arguments
   * @param {Object} history  History state model
   * @return {Lavaca.util.Promise}  A promise
   */
  index(params, history) {
    var model = new Model();
    model.set('headline','test');
    return this
      .view(null, HomeView, model)
      .then(this.updateState(history, 'Home Page', params.url));
  }
});
