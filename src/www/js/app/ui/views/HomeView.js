define(function(require) {

  var View = require('lavaca/mvc/View'),
      messages = require('i18n!app/nls/messages'),
      template = require('rdust!templates/home');

  /**
   * Example view type
   * @class app.ui.views.HomeView
   * @extends lavaca.mvc.View
   */
  var HomeView = View.extend({
    /**
     * A class name added to the view container
     * @property {String} className
     * @default 'home'
     */
    className: 'home',

    generateHtml: function(model) {
      model.messages = messages;
      return new Promise(function(resolve) {
        template.render(model, function(err, html) {
          resolve(html);
        });
      });
    }

  });

  return HomeView;

});
