var _commonTiming = "250ms";
module.exports = {
  "FADE": {
    'in': function(el){
            return new Promise(function(resolve,reject){
              el.css({
                'opacity': '0',
                'transition': 'all '+_commonTiming+' ease-out',
                'z-index': '999'
              });
              setTimeout(function(){
                el.css({
                  'visibility': 'visible'
                });
                setTimeout(function(){
                  el.nextTransitionEnd(function(){
                    return resolve();
                  });
                  el.css({
                    'opacity': '1'
                  });
                },1);
              },1);
            }.bind(this));
          },
    'out': function(el){
            return new Promise(function(resolve,reject){
              el.css({
                'opacity': '1',
                'transition': 'all '+_commonTiming+' ease-out',
                'z-index': '1'
              });
              setTimeout(function(){
                el.css({
                  'visibility': 'visible'
                });
                setTimeout(function(){
                  el.nextTransitionEnd(function(){
                    return resolve();
                  });
                  el.css({
                    'opacity': '0'
                  });
                },1);
              },1);
            }.bind(this));
          },
    'inReverse': function(el){
            return new Promise(function(resolve,reject){
              el.css({
                'opacity': '0',
                'transition': 'all '+_commonTiming+' ease-out',
                'z-index': '999'
              });
              setTimeout(function(){
                el.css({
                  'visibility': 'visible'
                });
                setTimeout(function(){
                  el.nextTransitionEnd(function(){
                    return resolve();
                  });
                  el.css({
                    'opacity': '1'
                  });
                },1);
              },1);
            }.bind(this));
          },
    'outReverse': function(el){
            return new Promise(function(resolve,reject){
              el.css({
                'opacity': '1',
                'transition': 'all '+_commonTiming+' ease-out',
                'z-index': '1'
              });
              setTimeout(function(){
                el.css({
                  'visibility': 'visible'
                });
                setTimeout(function(){
                  el.nextTransitionEnd(function(){
                    return resolve();
                  });
                  el.css({
                    'opacity': '0'
                  });
                },1);
              },1);
            }.bind(this));
          }
  },
  "SLIDE": {
    'in': function(el){
            return new Promise(function(resolve,reject){
              //console.log('SLIDE in');
              el.css({
                'transform': 'translate3d(100%,0,0)',
                'transition': 'all '+_commonTiming+' ease-out',
                'z-index': '999'
              });
              setTimeout(function(){
                el.css({
                  'visibility': 'visible'
                });
                setTimeout(function(){
                  el.nextTransitionEnd(function(){
                    return resolve();
                  });
                  el.css({
                    'transform': 'translate3d(0,0,0)'
                  });
                },1);
              },1);
            }.bind(this));
          },
    'out': function(el){
            return new Promise(function(resolve,reject){
              //console.log('SLIDE out');
              el.css({
                'transform': 'translate3d(0,0,0)',
                'transition': 'all '+_commonTiming+' ease-out',
                'z-index': '1'
              });
              setTimeout(function(){
                el.css({
                  'visibility': 'visible'
                });
                setTimeout(function(){
                  el.nextTransitionEnd(function(){
                    return resolve();
                  });
                  el.css({
                    'transform': 'translate3d(-20%,0,0)'
                  });
                },1);
              },1);
            }.bind(this));
          },
    'inReverse': function(el){
            return new Promise(function(resolve,reject){
              //console.log('SLIDE inReverse');
              el.css({
                'transform': 'translate3d(-20%,0,0)',
                'transition': 'all '+_commonTiming+' ease-out',
                'z-index': '1'
              });
              setTimeout(function(){
                el.css({
                  'visibility': 'visible'
                });
                setTimeout(function(){
                  el.nextTransitionEnd(function(){
                    return resolve();
                  });
                  el.css({
                    'transform': 'translate3d(0,0,0)'
                  });
                },1);
              },1);

            }.bind(this));
          },
    'outReverse': function(el){
            return new Promise(function(resolve,reject){
              //console.log('SLIDE outReverse');
              el.css({
                'transform': 'translate3d(0,0,0)',
                'transition': 'all '+_commonTiming+' ease-out',
                'z-index': '999'
              });
              setTimeout(function(){
                el.css({
                  'visibility': 'visible'
                });
                setTimeout(function(){
                  el.nextTransitionEnd(function(){
                    return resolve();
                  });
                  el.css({
                    'transform': 'translate3d(100%,0,0)'
                  });
                },1);
              },1);
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
              var animationClass = 'pt-page-onbottom pt-page-scaleDown';
              el.nextAnimationEnd(function(){
                setTimeout(function(){ if (el) { el.removeClass(animationClass); } }, 10);
                return resolve();
              })
              .addClass(animationClass);
            }.bind(this));
          },
    'inReverse': function(el){
            return new Promise(function(resolve,reject){
              var animationClass = 'pt-page-onbottom pt-page-scaleUp';
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
  },
  "NONE": {
    'in': function(el){
            return new Promise(function(resolve,reject){
              //console.log('NONE in');
              el.css({
                'visibility': 'visible',
                'z-index': '999'
              });
              setTimeout(function() {
                return resolve();
              }, 1);
            }.bind(this));
          },
    'out': function(el){
            return new Promise(function(resolve,reject){
              //console.log('NONE out');
              el.css({
                'visibility': 'hidden',
                'z-index': '1'
              });
              setTimeout(function() {
                return resolve();
              }, 1);
            }.bind(this));
          },
    'inReverse': function(el){
            return new Promise(function(resolve,reject){
              //console.log('NONE inReverse');
              el.css({
                'visibility': 'visible',
                'z-index': '999'
              });
              setTimeout(function() {
                return resolve();
              }, 1);
            }.bind(this));
          },
    'outReverse': function(el){
            return new Promise(function(resolve,reject){
              //console.log('NONE outReverse');
              el.css({
                'visibility': 'hidden',
                'z-index': '1'
              });
              setTimeout(function() {
                return resolve();
              }, 1);
            }.bind(this));
          }
  }
};