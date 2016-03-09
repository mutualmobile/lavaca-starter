define(function(require) {

  var BaseController = require('app/net/BaseController');

  /**
   * @class <%= classDotNotation %>
   * @super app.net.BaseController
   * <%= className %><%=postfix%>
   */
  var <%= className %><%=postfix%> = BaseController.extend(function <%= className %><%=postfix%>(){
      BaseController.apply(this, arguments);
    }, {
    /**
     * @method index
     * index action, creates a history state and shows a view
     *
     * @param {Object} params  Action arguments
     * @param {Object} model  History state model
     * @return {Lavaca.util.Promise}  A promise
     */
     index: function(params, model) {
       if (!model) {
         model = {};
       }
       return this
         .view(null, ExampleView, model, params)
         .then(this.updateState(model, 'Title', params.url));
     }
  });

  return <%= className %><%=postfix%>;
});