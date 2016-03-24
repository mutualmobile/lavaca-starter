import 'css/app/app.less';
import 'imports?$=jquery!hammer';
import 'app/env/ModernizrTests';
import 'app/utils/hammer_extensions';
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
