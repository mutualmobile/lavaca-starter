module.exports = {
  "FADE": {
    'in': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'faded-out pt-page-fade-in pt-page-ontop';
              el.nextAnimationEnd(function(){
                if (el) { el.removeClass(animationClass); }
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'out': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-fade-out';
              el.nextAnimationEnd(function(){
                setTimeout(function(){ if (el) { el.removeClass(animationClass); } }, 10);
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'inReverse': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'faded-out pt-page-fade-in pt-page-ontop';
              el.nextAnimationEnd(function(){
                if (el) { el.removeClass(animationClass); }
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'outReverse': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-fade-out';
              el.nextAnimationEnd(function(){
                setTimeout(function(){ if (el) { el.removeClass(animationClass); } }, 10);
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          }
  },
  "SLIDE": {
    'in': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-moveFromRight pt-page-ontop';
              el.nextAnimationEnd(function(){
                if (el) { el.removeClass(animationClass).find('.back').addClass('show'); }
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'out': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-scaleDown';
              el.nextAnimationEnd(function(){
                setTimeout(function(){ if (el) { el.removeClass(animationClass); } }, 10);
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'inReverse': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-scaleUp';
              el.nextAnimationEnd(function(){
                if (el) { el.removeClass(animationClass).find('.back').addClass('show'); }
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'outReverse': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-moveToRight pt-page-ontop';
              el.nextAnimationEnd(function(){
                setTimeout(function(){ if (el) { el.removeClass(animationClass); } }, 10);
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          }
  },
  "SLIDEUP": {
    'in': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-moveFromBottom pt-page-ontop';
              el.nextAnimationEnd(function(){
                if (el) { el.removeClass(animationClass); }
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'out': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-scaleDown';
              el.nextAnimationEnd(function(){
                setTimeout(function(){ if (el) { el.removeClass(animationClass); } }, 10);
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'inReverse': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-scaleUp';
              el.nextAnimationEnd(function(){
                if (el) { el.removeClass(animationClass); }
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'outReverse': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-moveToBottom pt-page-ontop';
              el.nextAnimationEnd(function(){
                setTimeout(function(){ if (el) { el.removeClass(animationClass); } }, 10);
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          }
  }
};