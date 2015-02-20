define(function(require) {
  var Model = require('lavaca/mvc/Model'),
			Config = require('app/env/Config');

  var StateModel = Model.extend(function() {
		Model.call(this, arguments);
    // this.on('change', this.setStore.bind(this));
  }, {
    // onChange:function(change){
    //   //[TODO make this save to local store and add modernizer to handle changes]
    //   //potentially make a RoleModel or PermissionModel that does this instead
      
    // }
  });

  return new StateModel();
});