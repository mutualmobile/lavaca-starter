let Collection = require('lavaca/mvc/Collection');
let Model = require('lavaca/mvc/Model');

/**
 * @class <%= classDotNotation %>
 * @super lavaca.mvc.Collection
 * <%= className %><%=postfix%> collection type
 */
module.exports = Collection.extend(function <%= className %><%=postfix%>(){
  Collection.apply(this, arguments);
},{

  TModel: Model,
  itemsProperty: 'item'

});