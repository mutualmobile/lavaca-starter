define(function(require) {
  var React = require('react');

  var DashboardView = require('app/components/DashboardView.js'),
      HomeView = require('jsx!app/components/HomeView.jsx'),
      DashboardViewModel = require('app/models/DashboardViewModel'),
      BaseController = require('app/net/BaseController'),
      Model = require('lavaca/mvc/Model');

  var HomeController = BaseController.extend({
    index: function(params, history) {
      var dashboardModel = new DashboardViewModel();
      // React.renderComponent(<DashboardView model={dashboardModel}/>, document.getElementById('view-root'));
      return this.view(HomeView, dashboardModel)
        .then(this.updateState(history, 'React!!!', params.url));
    },
    dashboard: function(params, history) {
      var dashboardModel = new DashboardViewModel();
      // React.renderComponent(<DashboardView model={dashboardModel}/>, document.getElementById('view-root'));
      return this.view(DashboardView, dashboardModel)
        .then(this.updateState(history, 'React!!!', params.url));
    }
  });

  return HomeController;

});
