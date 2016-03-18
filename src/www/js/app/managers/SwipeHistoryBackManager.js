define(function(require) {
  var Disposable = require('lavaca/util/Disposable'),
      Transition = require('lavaca/fx/Transition'),
      Transform = require('lavaca/fx/Transform'),
      viewManager = require('lavaca/mvc/ViewManager');

  var SwipeHistoryBackManager = Disposable.extend(function SwipeHistoryBackManager() {
    Disposable.call(this, arguments);

    this.init();
  },{

    leftThreshold: 20,
    completionSpeed: 0.1,
    returningViewAnimationRatio: 0.2,

    init: function() {
      viewManager.el.on('touchstart', this.onTouchStart.bind(this));
      viewManager.el.on('touchmove', this.onTouchMove.bind(this));
      viewManager.el.on('touchend', this.onTouchEnd.bind(this));
      this.el = viewManager.el.find('>.view.current');
    },

    onTouchStart: function(e) {
      this.el = viewManager.el.find('>.view.current');
      this.lastX = e.originalEvent.touches[0].clientX;
      this.startX = this.lastX;
      this.isTracking = this.lastX < this.leftThreshold && 
                        (viewManager.breadcrumb.length > 1) && 
                        window.Modernizr['ios-installed'];

      if (this.isTracking) {

        this.windowWidth = Number($(window).innerWidth());
        this.updateTransitionSpeed(0);

        if (viewManager.breadcrumb.length > 0) {
          this.pageView = viewManager.buildPageView(viewManager.breadcrumb[viewManager.breadcrumb.length - 2]);
          this.pageView.render();
          this.updateTransitionSpeedEl(this.pageView.el, 0);
          this.updateCssEl(this.pageView.el, this.elReturningStartingTranslateValue());
          this.el.css(
            {'z-index': '5'}
          );
          this.pageView.el.addClass('returning-view').css(
            {'visibility': 'visible'}
          );
          this.pageView.insertInto(viewManager.el);
          this.elReturning = $('.returning-view');
        }

      }
    },

    onTouchMove: function(e) {
      if (!this.isTracking) {
        return;
      }

      this.lastX = e.originalEvent.touches[0].clientX;
      this.update(this.lastX);
    },

    onTouchEnd: function(e) {
      if (!this.isTracking) {
        return;
      }

      var threshold = this.windowWidth / 2;
      this.updateTransitionSpeed(this.completionSpeed);
      if (this.lastX >= threshold) {
        this.el.nextTransitionEnd(function () {

          viewManager.rewind(this.pageView);
          this.elReturning.addClass('current').removeClass('returning-view');
          setTimeout(function(){
            this.pageView.enterHasCompleted();
          }.bind(this),50);

        }.bind(this));
        this.update(this.windowWidth);
      } else if ((this.lastX - this.startX) > 0) {
        this.el.nextTransitionEnd(function () {
          this.elReturning.detach();
        }.bind(this));
        this.update(0);
      } else {
        this.elReturning.detach();
        this.update(0);
      }
    },

    update: function (value, speed) {
      function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
      if (isNumber(value)) {
        this.updateCss(value);
      }
      if (isNumber(speed)) {
        this.updateTransitionSpeed(speed);
      }
    },

    elReturningStartingTranslateValue: function() {
      var value = 0 - (this.windowWidth * this.returningViewAnimationRatio);
      return value+'px,0,0';
    },
    elReturningValue: function(value) {
      value = (0 - (this.windowWidth * this.returningViewAnimationRatio)) + (value * this.returningViewAnimationRatio);
      return value;
    },

    updateCss: function (value) {
      var translateValue = value+'px,0,0';
      var returningTranslateValue = this.elReturningValue(value)+'px,0,0';
      this.updateCssEl(this.el, translateValue);
      this.updateCssEl(this.elReturning, returningTranslateValue);
    },
    updateCssEl: function (el, translateValue) {
      if (el) {
        el.css(Transform.cssProperty(), 'translate3d('+translateValue+')');
      }
    },

    updateTransitionSpeed: function (value) {
      this.updateTransitionSpeedEl(this.el, value);
      this.updateTransitionSpeedEl(this.elReturning, value);
    },
    updateTransitionSpeedEl: function (el, value) {
      if (el) {
        el.css(Transition.cssProperty(),'all '+value+'s ease-out');
      }
    }

  });


  return new SwipeHistoryBackManager();

});