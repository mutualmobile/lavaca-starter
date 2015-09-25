define(function(require) {

  var Model = require('lavaca/mvc/Model');

  /**
   * @class <%= classDotNotation %>
   * @super lavaca.mvc.Model
   * <%= className %><%=postfix%> model type
   */
  var <%= className %><%=postfix%> = Model.extend(function <%= className %><%=postfix%>(){
    Model.apply(this, arguments);
  },{

  });

  return <%= className %><%=postfix%>;

});
