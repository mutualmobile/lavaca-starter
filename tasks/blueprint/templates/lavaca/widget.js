let Widget = require('lavaca/ui/Widget');

/**
 *
 * @class <%= classDotNotation %>
 * @extends lavaca.ui.Widget
 *
 * @constructor
 * @param {jQuery} el  The DOM element that is the root of the widget
 */

module.exports = Widget.extend(function <%= className %><%=postfix%>() {
  Widget.apply(this, arguments);
}, {

});

