import {Controller} from 'lavaca';
import {merge} from 'mout/object';
import {default as stateModel} from 'app/models/StateModel';

/**
 * Base controller
 * @class app.net.BaseController
 * @extends Lavaca.mvc.Controller
 */
export let BaseController = Controller.extend(function(){
    Controller.apply(this, arguments);
  }, {
  updateState: function(historyState, title, url, stateProps){
    var defaultStateProps = {pageTitle: title};
    this.history(historyState, title, url)();

    stateProps = merge(stateProps || {}, defaultStateProps);
    stateModel.apply(stateProps, true);
    stateModel.trigger('change');
  }
});