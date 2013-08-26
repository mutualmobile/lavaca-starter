define(function(require) {

  var BaseView = require('./BaseView');
  require('rdust!templates/home');

  /**
   * Example view type
   * @class app.ui.views.HomeView
   * @extends app.ui.views.BaseView
   */
  var HomeView = BaseView.extend({
    /**
     * The name of the template used by the view
     * @property {String} template
     * @default 'home'
     */
    template: 'templates/home',
    /**
     * A class name added to the view container
     * @property {String} className
     * @default 'home'
     */
    className: 'home'

  });

  return HomeView;

});
