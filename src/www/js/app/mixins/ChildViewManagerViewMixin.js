import {ViewTransitionAnimations} from 'app/animations/ViewTransitionAnimations';
import {History, Animation, View} from 'lavaca';

export let ChildViewManagerViewMixin = {
  pageTransition: ViewTransitionAnimations.SLIDE,
  /**
   * Executes when a hardware back button is pressed
   * @method onTapBack
   */
  onTapBack() {
    History.back();
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
    if (window.Modernizr['should-use-desktop-nav']) {
      $(window).scrollTop(0);
    }
    if(!this.parentView.childViewManager){
      return View.prototype.enter.apply(this, arguments);
    }
    var isRoutingBack = this.parentView.childViewManager.isRoutingBack;
    return View.prototype.enter.apply(this, arguments)
      .then(() => {
        if (isRoutingBack) {
          if (this.parentView.childViewManager.animationBreadcrumb.length > 0) {
            this.pageTransition = this.parentView.childViewManager.animationBreadcrumb.pop();
          }
        } else {
          this.parentView.childViewManager.animationBreadcrumb.push(this.pageTransition);
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
          animationIn.call(this, this.el).then(() => {
            this.trigger('entercomplete');
            this.el.addClass('current');
          });

        } else {
          this.trigger('entercomplete');
          this.el.addClass('current');
        }
        return Promise.resolve();
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
  exit: function(container, enteringViews) {
    if(!this.parentView.childViewManager){
      return View.prototype.exit.apply(this, arguments);
    }
    var animation = this.parentView.childViewManager.isRoutingBack ? this.pageTransition['outReverse'] : (enteringViews.length ? enteringViews[0].pageTransition['out'] : '');

    if (this.parentView.childViewManager.isRoutingBack && !enteringViews.length) {
      this.pageTransition = this.parentView.childViewManager.animationBreadcrumb.pop();
      animation = this.pageTransition['outReverse'];
    }

    this.exitPromise = new $.Deferred();

    if (enteringViews.length) {
      animation.call(this, this.el).then(()=>{
        View.prototype.exit.apply(this, arguments).then(() =>{
          this.exitPromise.resolve();
        });
        this.el.removeClass('current');
      });
    } else {
      animation.call(this, this.el);
    }

    return this.exitPromise;

  }
};