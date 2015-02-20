define(function(require) {

  var Controller = require('lavaca/mvc/Controller');
  var merge = require('mout/object/merge');
  var stateModel = require('app/models/StateModel');

  /**
   * Base controller
   * @class app.net.BaseController
   * @extends Lavaca.mvc.Controller
   */
  var BaseController = Controller.extend(function(){
      Controller.apply(this, arguments);
    }, {
    updateState: function(historyState, title, url, stateProps){
      title = title || 'Lavaca';
      var defaultStateProps = {pageTitle: title};
      this.history(historyState, 'Lavaca React - ' + title, url)();

      stateProps = merge(stateProps || {}, defaultStateProps);
      stateModel.apply(stateProps, true);
      stateModel.trigger('change');
    }
  });

  return BaseController;

});