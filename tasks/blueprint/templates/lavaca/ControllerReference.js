var <%= className %>View = require('app/ui/views/pageviews/<%= className %>View')

/**
 * <%= className %> action, creates a history state and shows a view
 * @method <%=classNameLowerCase %>
 *
 * @param {Object} params  Action arguments
 * @param {Object} history  History state model
 * @return {Lavaca.util.Promise}  A promise
 */
<%=classNameLowerCase %>: function(params, history) {
  var model = new Model();
  return this
    .view(null, <%= className %>View, model)
    .then(this.updateState(history, '<%= className %> Page', params.url));
}