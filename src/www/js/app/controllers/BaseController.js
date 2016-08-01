import {Controller} from 'lavaca';

/**
 * Base controller
 * @class app.net.BaseController
 * @extends Lavaca.mvc.Controller
 */
export let BaseController = Controller.extend(function(){
    Controller.apply(this, arguments);
  }, {
  updateState: function(historyState, title, url, stateProps){
    this.history(historyState, title, url)();
  }
});
