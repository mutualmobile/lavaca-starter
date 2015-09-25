define(function(require) {

  var View = require('lavaca/mvc/View'),
      viewManager = require('lavaca/mvc/ViewManager'),
      History = require('lavaca/net/History'),
      ViewTransitionAnimations = require('app/animations/ViewTransitionAnimations');
  require('lavaca/fx/Animation'); //jquery plugins

  /**
   * A View from which all other application Views can extend.
   * Adds support for animating between views.
   *
   * @class app.ui.views.BaseView
   * @extends Lavaca.mvc.View
   *
   */
  var BaseView = View.extend(function() {
    View.apply(this, arguments);
    this.mapEvent('.cancel', 'tap', this.onTapCancel);
  }, {

    /**
     * The name of the template used by the view
     * @property {Object} pageTransition
     * @default 'default'

     */
    pageTransition: ViewTransitionAnimations.FADE,
    /**
     * Executes when the template renders successfully. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     * @method onRenderSuccess
     *
     * @param {Event} e  The render event. This object should have a string property named "html"
     *   that contains the template's rendered HTML output.
     */
    onRenderSuccess: function() {
      View.prototype.onRenderSuccess.apply(this, arguments);
    },
    /**
     * Handler for when a cancel control is tapped
     * @method onTapCancel
     *
     * @param {Event} e  The tap event.
     */
    onTapCancel: function(e) {
      e.preventDefault();
      viewManager.dismiss(e.currentTarget);
    },
    /**
     * Handler for when a view has completed its animation into view
     * and hides the cordova splashscreen if it is included
     * @method enterHasCompleted
     */
    enterHasCompleted: function() {
      this.trigger('entercomplete');
      setTimeout(function() {
        if (navigator && navigator.splashscreen) {
          navigator.splashscreen.hide();
        }
      }, 200);
    },
    /**
     * Executes when the user navigates to this view. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     * @method enter
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} exitingViews  The views that are exiting as this one enters
     * @return {Lavaca.util.Promise} A promise
     */
    enter: function(container, exitingViews) {
      var isRoutingBack = History.isRoutingBack;
      return View.prototype.enter.apply(this, arguments)
        .then(function() {
          if (isRoutingBack) {
            if (History.animationBreadcrumb.length > 0) {
              this.pageTransition = History.animationBreadcrumb.pop();
            }
          } else {
            History.animationBreadcrumb.push(this.pageTransition);
          }
          var animationIn = isRoutingBack ? this.pageTransition['inReverse']:this.pageTransition['in'],
              animationOut = isRoutingBack ? this.pageTransition['outReverse']:this.pageTransition['out'],
              i = -1,
              exitingView;

          if (exitingViews.length) {
            i = -1;
            while (!!(exitingView = exitingViews[++i])) {
              exitingView.el.removeClass('current');
              animationOut.call(this, exitingView.el);
              if (exitingView.exitPromise) {
                exitingView.exitPromise.resolve();
              }
            }
          }

          if ((this.layer > 0 || exitingViews.length > 0)) {
            animationIn.call(this, this.el).then(function() {
              this.enterHasCompleted();
              this.el.addClass('current');
            }.bind(this));

          } else {
            this.el.addClass('current');
            this.enterHasCompleted();
          }

        }.bind(this));
    },
    /**
     * Executes when the user navigates away from this view. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     * @method exit
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} enteringViews  The views that are entering as this one exits
     * @return {Lavaca.util.Promise} A promise
     */
    exit: function(container, enteringViews) {
      var animation = History.isRoutingBack ? this.pageTransition['outReverse'] : (enteringViews.length ? enteringViews[0].pageTransition['out'] : '');

      if (History.isRoutingBack && !enteringViews.length) {
        this.pageTransition = History.animationBreadcrumb.pop();
        animation = this.pageTransition['outReverse'];
      }

      this.exitPromise = new $.Deferred();

      if (enteringViews.length) {
        animation.call(this, this.el).then(function(){
          View.prototype.exit.apply(this, arguments).then(function() {
            this.exitPromise.resolve();
          });
          this.el.removeClass('current');
        }.bind(this));
      } else {
        animation.call(this, this.el);
      }

      return this.exitPromise;

    }
  });

  return BaseView;

});
