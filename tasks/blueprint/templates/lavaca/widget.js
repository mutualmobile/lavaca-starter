import { Widget } from 'lavaca';

/**
 *
 * @class <%= classDotNotation %>
 * @extends lavaca.ui.Widget
 *
 * @constructor
 * @param {jQuery} el  The DOM element that is the root of the widget
 */

export let <%= className %><%=postfix%> = Widget.extend(function <%= className %><%=postfix%>() {
  Widget.apply(this, arguments);
}, {

});

