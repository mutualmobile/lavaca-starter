import {default as View} from 'lavaca/mvc/View';
import template from 'templates/home';

/**
 * Example view type
 * @class app.ui.views.HomeView
 * @extends lavaca.mvc.View
 */

export let HomeView = View.extend(function HomeView() {
  View.apply(this,arguments);
},{
  /**
   * A class name added to the view container
   * @property {String} className
   * @default 'home'
   */
  className: 'home',
  generateHtml(model) {
    return new Promise((resolve) => {
      template(model, (err, html) => {
        resolve(html);
      });
    });
  }
});