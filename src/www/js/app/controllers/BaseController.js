import {Controller} from 'lavaca';
import {merge} from 'mout/object';
import {default as StateModel} from 'app/models/StateModel';

/**
 * Base controller
 * @class app.net.BaseController
 * @extends Lavaca.mvc.Controller
 */
var BaseController = Controller.extend(function(){
    Controller.apply(this, arguments);
  }, {
  updateState: function(historyState, title, url, stateProps){
    var defaultStateProps = {pageTitle: title};
    this.history(historyState, title, url)();

    stateProps = merge(stateProps || {}, defaultStateProps);
    StateModel.apply(stateProps, true);
    StateModel.trigger('change');
  }
});

module.exports = BaseController;