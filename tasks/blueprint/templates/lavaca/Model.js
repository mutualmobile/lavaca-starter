import { Model } from 'lavaca';

/**
 * @class <%= classDotNotation %>
 * @super lavaca.mvc.Model
 * <%= className %><%=postfix%> model type
 */
export let <%= className %><%=postfix%> = Model.extend(function <%= className %><%=postfix%>(){
  Model.apply(this, arguments);
},{

});