define(function(require) {

  var BaseView = require('./BaseView');
  var template = require('rdust!templates/home');

  /**
   * Example view type
   * @class app.ui.views.HomeView
   * @extends app.ui.views.BaseView
   */
  var HomeView = BaseView.extend({
    /**
     * A class name added to the view container
     * @property {String} className
     * @default 'home'
     */
    className: 'home',

    generateHtml: function(model) {
      return new Promise(function(resolve) {
        template.render(model, function(err, html) {
          resolve(html);
        });
      });
    }

  });

  return HomeView;

});
