define(function(require) {
  var React = require('react'),
      router = require('lavaca/mvc/Router');

  var HomeView = React.createLavacaClass({
    render: function () {
      return (
        <div className="react-components" onClick={this.clickHandler}>Go To Paragraph View</div>
      );
    },
    clickHandler:function(){
      router.exec('/dashboard');
    }
  });

  return HomeView;

});
