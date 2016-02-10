import BaseView from './BaseView';
import template from 'templates/pageviews/home';

/**
 * Example view type
 * @class app.ui.views.HomeView
 * @extends app.ui.views.BaseView
 */
module.exports = BaseView.extend(function() {
  BaseView.apply(this,arguments);
  this.mapEvent('.test', 'tap', this.onTapCancel);
},{
  /**
   * A class name added to the view container
   * @property {String} className
   * @default 'home'
   */
  text:'Hello World',
  className: 'home',
  onTapCancel(){
    this.model.set('headline','Ello puppet');
    this.render();
  },
  generateHtml(model) {
    return new Promise(function(resolve) {
      template(model, function(err, html) {
        resolve(html);
      });
    });
  }

});