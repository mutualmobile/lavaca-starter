import {Disposable,Transition,Transform,Router,ViewManager as viewManager} from 'lavaca';

  var SwipeBackManager = Disposable.extend(function SwipeHistoryBackManager() {
    Disposable.call(this, arguments);

    this.init();
  },{

    leftThreshold: 20,
    completionSpeed: 0.1,
    returningViewAnimationRatio: 0.2,

    init() {
      viewManager.el.on('touchstart', this.onTouchStart.bind(this));
      viewManager.el.on('touchmove', this.onTouchMove.bind(this));
      viewManager.el.on('touchend', this.onTouchEnd.bind(this));
      this.el = viewManager.el.find('>.view.current');
    },

    onTouchStart(e) {
      if (e.originalEvent.touches[1]) {
        e.preventDefault();
        return;
      }

      this.touchId = e.originalEvent.changedTouches[0].identifier;

      this.el = viewManager.el.find('>.view.current');
      this.lastX = e.originalEvent.touches[0].clientX;
      this.startX = this.lastX;
      this.isTracking = this.lastX < this.leftThreshold && 
                        (viewManager.breadcrumb.length > 1) && 
                        window.Modernizr['ios-installed'];

      if (this.isTracking) {

        this.start();
        Router.locked = true;

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
          setTimeout(()=>this.pageView.trigger('enter'),0);
          this.elReturning = $('.returning-view');
        }

      }
    },

    onTouchMove(e) {
      if (!this.isTracking) {
        return;
      }
      e.preventDefault();

      this.lastX = e.originalEvent.touches[0].clientX;
      this.update(this.lastX);
    },

    onTouchEnd(e) {
      if (this.touchId !== e.originalEvent.changedTouches[0].identifier) {
        return;
      }

      if (!this.isTracking) {
        return;
      }
      Router.locked = false;

      var threshold = this.windowWidth / 2;
      this.updateTransitionSpeed(this.completionSpeed);
      if (this.lastX >= threshold) {
        this.el.nextTransitionEnd(function () {

          viewManager.rewind(this.pageView);
          this.elReturning.addClass('current').removeClass('returning-view');
          setTimeout(function(){
            this.pageView.enterHasCompleted();
            this.complete();
          }.bind(this),50);

        }.bind(this));
        this.update(this.windowWidth);
      } else if ((this.lastX - this.startX) > 0) {
        this.el.nextTransitionEnd(function () {
          this.elReturning.detach();
          this.complete();
        }.bind(this));
        this.update(0);
      } else {
        this.elReturning.detach();
        this.update(0);
        this.complete();
      }
    },

    start() {
      this.active = true;
    },
    complete() {
      this.active = false;
    },

    update(value, speed) {
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

    elReturningStartingTranslateValue() {
      var value = 0 - (this.windowWidth * this.returningViewAnimationRatio);
      return value+'px,0,0';
    },
    elReturningValue(value) {
      value = (0 - (this.windowWidth * this.returningViewAnimationRatio)) + (value * this.returningViewAnimationRatio);
      return value;
    },

    updateCss(value) {
      var translateValue = value+'px,0,0';
      var returningTranslateValue = this.elReturningValue(value)+'px,0,0';
      this.updateCssEl(this.el, translateValue);
      this.updateCssEl(this.elReturning, returningTranslateValue);
    },
    updateCssEl(el, translateValue) {
      if (el) {
        el.css(Transform.cssProperty(), 'translate3d('+translateValue+')');
      }
    },

    updateTransitionSpeed(value) {
      this.updateTransitionSpeedEl(this.el, value);
      this.updateTransitionSpeedEl(this.elReturning, value);
    },
    updateTransitionSpeedEl(el, value) {
      if (el) {
        el.css(Transition.cssProperty(),'all '+value+'s ease-out');
      }
    }

  });


  export let SwipeHistoryBackManager = new SwipeBackManager();
