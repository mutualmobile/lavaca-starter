define(function(require) {

  var Collection = require('lavaca/mvc/Collection');
  var Model = require('lavaca/mvc/Model');

  /**
   * @class <%= classDotNotation %>
   * @super lavaca.mvc.Collection
   * <%= className %><%=postfix%> collection type
   */
  var <%= className %><%=postfix%> = Collection.extend(function <%= className %><%=postfix%>(){
    Collection.apply(this, arguments);
  },{

    TModel: Model,
    itemsProperty: 'item'

  });

  return <%= className %><%=postfix%>;

});
