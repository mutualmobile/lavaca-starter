import { Collection, Model } from 'lavaca';

/**
 * @class <%= classDotNotation %>
 * @super lavaca.mvc.Collection
 * <%= className %><%=postfix%> collection type
 */
export let <%= className %><%=postfix%> = Collection.extend(function <%= className %><%=postfix%>(){
  Collection.apply(this, arguments);
},{

  TModel: Model,
  itemsProperty: 'item'

});