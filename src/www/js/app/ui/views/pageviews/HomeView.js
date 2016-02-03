var BaseView = require('./BaseView'),
    dust = require('dustjs-linkedin'),
    template = require('templates/pageviews/home');

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
    model.messages = {headline:'abc'};
    // return Promise.resolve('<h1>test</h1>');
    return new Promise(function(resolve) {
      template(model, function(err, html) {
        resolve(html);
      });
    });
  }

});

module.exports = HomeView;
