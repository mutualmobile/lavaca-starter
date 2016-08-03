import {default as View} from 'lavaca/mvc/View';
import {default as History} from 'lavaca/net/History';
import {default as ViewManager} from 'lavaca/mvc/ViewManager';

export let ViewManagerViewMixin = {
  /**
   * Handler for when a view has completed its animation into view
   * and hides the cordova splashscreen if it is included
   * @method enterHasCompleted
   */
  enterHasCompleted() {
    this.trigger('entercomplete');
    setTimeout(() => {
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
  enter(container, exitingViews) {
    var isRoutingBack = History.isRoutingBack;
    return View.prototype.enter.apply(this, arguments)
      .then(() => {
        var animation = ViewManager.breadcrumb.length > 1 && !window.Modernizr['should-use-desktop-nav'] ? this.pageTransition : this.rootPageTransition;

        if (isRoutingBack) {
          if (History.animationBreadcrumb.length > 0) {
            animation = History.animationBreadcrumb.pop();
          }
        } else {
          History.animationBreadcrumb.push(animation);
        }
        var animationIn = isRoutingBack ? animation['inReverse']:animation['in'],
            animationOut = isRoutingBack ? animation['outReverse']:animation['out'],
            i = -1,
            exitingView;

        if (exitingViews.length) {
          i = -1;
          while (!!(exitingView = exitingViews[++i])) {
            exitingView.el.removeClass('current');
            var onAnimationComplete = function() {
              if (this.el) {
                this.el.detach();
              }
              if (this.exitPromise) {
                this.exitPromise.resolve();
              }
              this.trigger('exit');
            }.bind(exitingView);
            animationOut.call(this, exitingView.el).then(onAnimationComplete);
          }
        }

        if ((this.layer > 0 || exitingViews.length > 0)) {
          animationIn.call(this, this.el).then(() => {
            this.enterHasCompleted();
            this.el.addClass('current');
          });

        } else {
          this.el.addClass('current').css('visibility', 'visible');
          this.enterHasCompleted();
        }

      });
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
  exit(container, enteringViews) {
    var animation = ViewManager.breadcrumb.length > 1 && !window.Modernizr['should-use-desktop-nav'] ? this.pageTransition : this.rootPageTransition;
    var animationOut = History.isRoutingBack ? animation['outReverse'] : (enteringViews.length ? enteringViews[0].pageTransition['out'] : '');

    if (History.isRoutingBack && !enteringViews.length) {
      animation = History.animationBreadcrumb.pop();
      animationOut = animation['outReverse'];
    }

    this.exitPromise = new $.Deferred();

    if (!enteringViews.length) {
      animationOut.call(this, this.el).then(
        () => {
          View.prototype.exit.apply(this, arguments).then(
            () => {
              this.exitPromise.resolve();
            });
        });
    }

    return this.exitPromise;

  }
};
