define(function(require) {

  var HomeView = require('app/ui/views/HomeView'),
      BaseController = require('app/net/BaseController');

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
     * @param {Object} model  History state model
     * @return {Lavaca.util.Promise}  A promise
     */
    index: function(params, model) {
      if (!model) {
        model = {};
      }
      return this
        .view(null, HomeView, model)
        .then(this.updateState(model, 'Home Page', params.url));
    }
  });

  return HomeController;

});
