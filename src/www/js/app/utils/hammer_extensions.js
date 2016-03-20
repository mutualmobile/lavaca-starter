var Hammer = require('hammer');

var _oldTapHandler = Hammer.gestures.Tap.handler;

// Customize hammer behavior to better match default iOS behavior
_defaults().tap_max_touchtime = Number.INFINITY;
_defaults().tap_max_distance = 8;

// Add new defaults
_defaults().tap_touch_class = 'touch';
_defaults().tap_touch_delay = 50;
_defaults().tap_min_highlight_duration = 100;

Hammer.gestures.Tap.handler = function(e, inst) {
  var type = e.eventType,
      data = Hammer.detection.current,
      didFireTap;

  if (type === 'start') {
    _showHighlight(e, data);
  } else if (type === 'move' && e.distance > inst.options.tap_max_distance) {
    _removeHighlight(e, data);
  } else if (type === 'end' ||
             type === 'cancel') {
    didFireTap = _callSuper.call(this, e, inst);
    _removeHighlight(e, data, didFireTap);
  }
};

// Hammer doesn't deal directly with event delegation.
// It just triggers the 'tap' event on the innermost
// tapped element and jQuery will catch that event as it
// bubbles up to the delegated elements. So, in order to
// make sure we add the touch highlight class to the delegated
// elements, we listen for our own custom events. These events
// will be triggered on the innermost tapped element and
// jQuery will handle the delegation.
$.event.special.tap = {
  add: function(handle) {
    var $el = $(this),
        delegate = handle.selector,
        data = handle.data;

    if (data && data.showHighlight === false) {
      return;
    }

    $el
      .on('tapAddHighlight', delegate, function(e) {
        $(this).addClass(_defaults().tap_touch_class);
        e.stopPropagation();
      });
    $el.on('tapRemoveHighlight', delegate, function(e) {
        $(this).removeClass(_defaults().tap_touch_class);
        e.stopPropagation();
      });
  }
};

// Utility functions
function _showHighlight(e, data) {
  var $el = $(e.target);
  clearTimeout(data._highlightTimeout);
  if (!_defaults().tap_touch_delay) {
    $el.trigger('tapAddHighlight');
  } else {
    data._highlightTimeout = setTimeout(function() {
      $el.trigger('tapAddHighlight');
    }, _defaults().tap_touch_delay);
  }
}

function _removeHighlight(e, data, didFireTap) {
  var $el = $(e.target);
  clearTimeout(data._highlightTimeout);
  if (didFireTap && (e.deltaTime < (_defaults().tap_min_highlight_duration + _defaults().tap_touch_delay))) {
    $el.trigger('tapAddHighlight');
    data._highlightTimeout = setTimeout(function(){_removeHighlight.call(this, e, data);}, _defaults().tap_min_highlight_duration);
  } else {
    $el.trigger('tapRemoveHighlight');
  }
}

// Calls original tap handler and returns true if
// tap was triggered, false otherwise
function _callSuper(e, inst) {
  var didFireTap = false,
      oldTrigger = inst.trigger;
  inst.trigger = function(type) {
    if (type === 'tap') {
      didFireTap = true;
      if (window.cordova && !$(e.target).is('input,select')) {
        $('input:focus, textarea:focus').blur();
        if (window.cordova.plugins && window.cordova.plugins.Keyboard) {
          window.cordova.plugins.Keyboard.close();
        }
      }
    }
    oldTrigger.apply(this, arguments);
  };
  _oldTapHandler.call(this, e, inst);
  inst.trigger = oldTrigger;
  return didFireTap;
}

// Returns the Tap handler defaults object
function _defaults() {
  return Hammer.gestures.Tap.defaults;
}

Hammer.defaults.stop_browser_behavior.touchAction = 'pan-y';
Hammer.defaults.stop_browser_behavior.userSelect = 'auto';
// delete Hammer.defaults.cssProps.userSelect;
