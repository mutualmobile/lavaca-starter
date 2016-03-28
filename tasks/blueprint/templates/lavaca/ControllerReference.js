import {<%= className %>View} from 'app/ui/views/<%= className %>View';

/**
 * <%= className %> action, creates a history state and shows a view
 * @method <%=classNameLowerCase %>
 *
 * @param {Object} params  Action arguments
 * @param {Object} history  History state model
 * @return {Lavaca.util.Promise}  A promise
 */
<%=classNameLowerCase %>(params, history) {
  var model = new Model();
  return this
    .view(null, <%= className %>View, model, params)
    .then(this.updateState(history, '<%= className %>', params.url));
}