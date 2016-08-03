import 'css/app.less';
import 'imports?$=jquery!jquery-mobile';
import 'app/env/ModernizrTests';
import 'dustjs-helpers';
import {default as History} from 'lavaca/net/History';
import {default as Connectivity} from 'lavaca/net/Connectivity';
import {default as Application} from 'lavaca/mvc/Application';
import {HomeController} from 'app/controllers/HomeController';
import {ViewManagerViewMixin} from 'app/mixins/ViewManagerViewMixin';
import {ViewManagerViewFillin} from 'app/mixins/ViewManagerViewFillin';

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

// Uses the output of DynamicRequirePlugin to load modules by name in the
// DevTools console
window.webpackRequire = function(name) {
  return __webpack_require__(window.webpackModuleMap[name]);
};
