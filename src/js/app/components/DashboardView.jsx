define(function(require) {
  var React = require('react');
    require('lavaca-mixin');

  var DashboardView = React.createLavacaClass({
    className:'dashboard',
    render: function () {
      return (
        <div className="react-components" onClick={this.clickHandler}>{this.model().get('paragraph')}</div>
      );
    },
    clickHandler:function(){
      if(this.model().get('paragraph') !== 'Click Me!'){
        this.model().set('paragraph','Click Me!');
      }
      else{
        this.model().set('paragraph','I changed. Click me again.');
      }
    }
  });

  return DashboardView;

});
