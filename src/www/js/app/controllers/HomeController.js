import {BaseController} from 'app/controllers/BaseController';
import {HomeView} from 'app/ui/views/HomeView';
import {Model} from 'lavaca';
/**
 * Home controller
 * @class app.net.HomeController
 * @extends app.net.BaseController
 */ 

export let HomeController = BaseController.extend({
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
    model.set('headline','Hello World');
    return this.view(null, HomeView, model, params)
               .then(this.updateState(history, 'Home Page', params.url));
  }
});
