define(function(require) {

  var Model = require('lavaca/mvc/Model');

  var BluetoothStateModel = Model.extend(function BluetoothStateModel() {
    Model.apply(this, arguments);

    _init.call(this);
  },{
    reset: function () {
      _init.call(this);
    },
    setCapabilities: function(obj) {
      if (typeof obj === "object") {
        for (var prop in obj) {
          this.setCapability(prop, obj[prop]);
        }
      }
    },
    setCapability: function(name, value) {
      this.set(name, value);
      Modernizr.setTest(name, value);
      //console.log('capability-'+name+':'+value);
    }
  });

  function _init() {
    this.set('address', '');
    this.set('scanResults', []);
    this.set('shouldPersistConnection', false);
  }

  return new BluetoothStateModel();
});