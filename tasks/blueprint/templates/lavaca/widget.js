define(function(require) {
  var Widget = require('lavaca/ui/Widget');

  /**
   *
   * @class <%= classDotNotation %>
   * @extends lavaca.ui.Widget
   *
   * @constructor
   * @param {jQuery} el  The DOM element that is the root of the widget
   */

  var <%= className %><%=postfix%> = Widget.extend(function <%= className %><%=postfix%>() {
    Widget.apply(this, arguments);
    setTimeout(_init.bind(this), 0);
  }, {

  });

  function _init() {

  }

  return <%= className %><%=postfix%>;
});