define(function(require) {
  var Model = require('lavaca/mvc/Model');


  var DashboardViewModel = Model.extend(function() {
    Model.call(this, arguments);
    this.set('paragraph','This is a test paragraph');
  });

  return DashboardViewModel;
});