import 'css/app.less';
import 'imports?$=jquery!jquery-mobile';
import 'app/env/ModernizrTests';
import 'dustjs-helpers';
import {History, Connectivity, Application} from 'lavaca';
import {HomeController} from 'app/controllers/HomeController';
import {ViewManagerViewMixin, ViewManagerViewFillin} from 'app/mixins';

History.overrideStandardsMode();

Connectivity.registerOfflineAjaxHandler(function() {
  alert("Offline");
});
export default new Application(function() {
  // Add routes
  this.router.add({
    '/': [HomeController, 'index']
  });

  this.viewManager.pageViewMixin = ViewManagerViewMixin;
  this.viewManager.pageViewFillin = ViewManagerViewFillin;
});
