let Model = require('lavaca/mvc/Model');

/**
 * @class <%= classDotNotation %>
 * @super lavaca.mvc.Model
 * <%= className %><%=postfix%> model type
 */
module.exports = Model.extend(function <%= className %><%=postfix%>(){
  Model.apply(this, arguments);
},{

});