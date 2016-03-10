let View = require('lavaca/mvc/View');
import template from 'templates/home';

/**
 * Example view type
 * @class app.ui.views.HomeView
 * @extends lavaca.mvc.View
 */
module.exports = View.extend(function HomeView() {
  View.apply(this,arguments);
},{
  /**
   * A class name added to the view container
   * @property {String} className
   * @default 'home'
   */
  text:'Hello World',
  className: 'home',
  generateHtml(model) {
    return new Promise(function(resolve) {
      template(model, function(err, html) {
        resolve(html);
      });
    });
  }

});