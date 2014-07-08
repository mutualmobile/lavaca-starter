define(function(require) {

  var View = require('lavaca/mvc/View'),
      stateModel = require('app/models/StateModel'),
      template = require('rdust!templates/header');

  /**
   * Header view type
   * @class app.ui.views.globalUI.HeaderView
   * @super Lavaca.mvc.View
   */
  var HeaderView = View.extend(function(){
      View.apply(this, arguments);

      this.mapEvent({
        model: {
          change: this.onModelChange.bind(this)
        }
      });
    }, {
    /**
     * A class name added to the view container
     * @property {String} className
     * @default 'header'
     */
    className: 'header',

    generateHtml: function(model) {
      return new Promise(function(resolve) {
        template.render(model, function(err, html) {
          resolve(html);
        });
      });
    },

    onModelChange: function() {
      this.redraw('.title');
    }
  });

  return new HeaderView('#nav-header', stateModel);
});
