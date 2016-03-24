import 'css/app/app.less';
import 'imports?$=jquery!hammer';
import {History, Connectivity, Application} from 'lavaca';

var HomeController = require('app/controllers/HomeController');
var ViewManagerViewMixin = require('app/mixins/ViewManagerViewMixin');
var ViewManagerViewFillin = require('app/mixins/ViewManagerViewFillin');

import 'app/env/ModernizrTests';
import 'app/utils/hammer_extensions';

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
