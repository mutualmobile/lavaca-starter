import { View } from 'lavaca';
import template from 'templates/<%=templateFolder%><%= className %><%=postfix%>';

/**
 * @class <%= classDotNotation %>
 * @super lavaca.mvc.View
 * <%= className %><%=postfix%> view type
 */
export let <%= className %><%=postfix%> = View.extend(function <%= className %><%=postfix%>(){
  View.apply(this, arguments);
},{
  /**
  * @field {String} className
  * @default '<%=classNameLowerCase %>'
  * A class name added to the view container
  */
  className: '<%=classNameLowerCase %>',
  generateHtml(model) {
    return new Promise((resolve) => {
      template(model, (err, html) => {
        resolve(html);
      });
    });
  }


});
