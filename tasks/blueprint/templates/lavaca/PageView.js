define(function(require) {

  var BaseView = require('app/ui/views/BaseView'),
      template = require('rdust!templates/<%=templateFolder%><%= className %><%=postfix%>');

/**
 * @class <%= classDotNotation %>
 * @super app.ui.views.BaseView
 * <%= className %><%=postfix%> view type
 */
  var <%= className %><%=postfix%> = BaseView.extend(function <%= className %><%=postfix%>(){
    BaseView.apply(this, arguments);
  },{
    /**
    * @field {String} className
    * @default '<%=classNameLowerCase %>'
    * A class name added to the view container
    */
    className: '<%=classNameLowerCase %>',
    generateHtml: function(model) {
      return new Promise(function(resolve) {
        template.render(model, function(err, html) {
          resolve(html);
        });
      });
    }

  });

  return <%= className %><%=postfix%>;

});
