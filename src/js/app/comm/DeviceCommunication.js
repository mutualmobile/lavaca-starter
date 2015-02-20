define(function(require) {
  var EventDispatcher = require('lavaca/events/EventDispatcher'),
      MessageTranslation = require('app/comm/MessageTranslation'),
      MessageQueue = require('app/comm/MessageQueue'),
      bluetoothStateModel = require('app/comm/BluetoothStateModel'),
      $ = require('$');

  var DeviceCommunication = EventDispatcher.extend(function() {
    EventDispatcher.call(this, arguments);
  },{
    verboseLogging: true,

    wireBind: function() {
      var promise = $.Deferred();
      var message = MessageTranslation.messageForWireBind();
      _log.call(this, "wireBind");
      MessageQueue.send(message).then(
        function(responseMessage){
          MessageTranslation.setWireBind(responseMessage);
          _log.call(this, "wireBind success");
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          _log.call(this, "wireBind error "+JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },


    // *********************************
    // Pump
    // *********************************
    pumpSetSleepNumber: function(side, number) {
      var message = MessageTranslation.messageForPumpSetSleepNumber(side, number);
      _log.call(this, "pumpSetSleepNumber: " + side +''+ number);
      return MessageQueue.send(message);
    },

    pumpGetMemory: function() {
      var promise = $.Deferred();
      var message = MessageTranslation.messageForPumpGetMemory();
      _log.call(this, "pumpGetMemory");
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForPumpGetMemory(responseMessage);
          _log.call(this, "pumpGetMemory: "+JSON.stringify(responseMessage.returnObject));
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          _log.call(this, "pumpGetMemory error "+JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },
    pumpSetMemory: function(side, number) {
      var message = MessageTranslation.messageForPumpSetMemory(side, number);
      _log.call(this, "pumpSetMemory: " + side +''+ number);
      return MessageQueue.send(message);
    },

    pumpGetStatus: function() {
      var promise = $.Deferred();
      var message = MessageTranslation.messageForPumpGetStatus();
      _log.call(this, "pumpGetStatus");
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForPumpGetStatus(responseMessage);
          _log.call(this, "pumpGetStatus: "+JSON.stringify(responseMessage.returnObject));
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          _log.call(this, "pumpGetStatus error "+JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },

    pumpGetJobStatus: function() {
      var message = MessageTranslation.messageForPumpGetJobStatus();
      return MessageQueue.send(message);
    },

    pumpSetForceIdle: function() {
      var message = MessageTranslation.messageForPumpSetForceIdle();
      return MessageQueue.send(message);
    },

    pumpGetState: function() {
      var promise = $.Deferred();
      var message = MessageTranslation.messageForPumpGetState();
      _log.call(this, "pumpGetState");
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForPumpGetState(responseMessage);
          _log.call(this, "pumpGetState: "+JSON.stringify(responseMessage.returnObject));
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          _log.call(this, "pumpGetState error "+JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },

    pumpGetSoftwareVersion: function() {
      var promise = $.Deferred();
      var message = MessageTranslation.messageForPumpGetSoftwareVersion();
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForPumpGetSoftwareVersion(responseMessage);
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },






    // *********************************
    // MCR Proxy
    // *********************************
    proxyGetNodeList: function() {
      var promise = $.Deferred();
      var message = MessageTranslation.messageForProxyGetNodeList();
      _log.call(this, "proxyGetNodeList");
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForProxyGetNodeList(responseMessage);
          _log.call(this, "proxyGetNodeList:" + JSON.stringify(responseMessage.returnObject));

          bluetoothStateModel.setCapabilities(responseMessage.returnObject);

          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          _log.call(this, "proxyGetNodeList error:" + JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },
    proxySetAddNode: function(device) {
      var message = MessageTranslation.messageForSetAddNode(device);
      return MessageQueue.send(message);
    },
    proxySetRemoveNode: function(device) {
      var message = MessageTranslation.messageForSetRemoveNode(device);
      return MessageQueue.send(message);
    },





    // *********************************
    // Foundation Control
    // *********************************
    foundationSetAdjustment: function(side) {
      if (!bluetoothStateModel.get('hasFoundation')) {
        var promise = $.Deferred();
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationSetAdjustment(side);
      return MessageQueue.send(message);
    },
    foundationGetSystemStatus: function() {
      var promise = $.Deferred();
      if (!bluetoothStateModel.get('hasFoundation')) {
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationGetSystemStatus();
      _log.call(this, "foundationGetSystemStatus");
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForFoundationGetSystemStatus(responseMessage);

          bluetoothStateModel.setCapabilities(responseMessage.returnObject);
          //_log.call(this, "foundationGetSystemStatus:" + JSON.stringify(responseMessage));
          _log.call(this, "foundationGetSystemStatus:" + JSON.stringify(responseMessage.returnObject));
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          _log.call(this, "foundationGetSystemStatus error:" + JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },
    foundationGetAdjustment: function() {
      var promise = $.Deferred();
      if (!bluetoothStateModel.get('hasFoundation')) {
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationGetAdjustment();
      _log.call(this, "foundationGetAdjustment");
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForFoundationGetAdjustment(responseMessage);
          //_log.call(this, "foundationGetAdjustment:" + JSON.stringify(responseMessage));
          _log.call(this, "foundationGetAdjustment:" + JSON.stringify(responseMessage.returnObject));
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          _log.call(this, "foundationGetAdjustment error:" + JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },
    foundationSetMotionHalt: function(side, stopHead, stopFoot, stopMassage) {
      if (!bluetoothStateModel.get('hasFoundation')) {
        var promise = $.Deferred();
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationSetMotionHalt(side, stopHead, stopFoot, stopMassage);
      return MessageQueue.send(message);
    },
    foundationSetLight: function(which, state, timeout) {
      //which   - 
      // 0x1: Right outlet
      // 0x2: Left outlet
      // 0x3: Right Under-bed lighting
      // 0x4: Left Under-bed lighting
      // 0x5: Apply to both outlets (new value and timer)
      // 0x6: Apply to both under-bed lighting (new value and timer) 
      // 0x7: Apply to all outlets and under-bed lighting (new value and timer)
      // 0x8: Apply to right outlet and under-bed light (new value and timer)
      // 0x9: Apply to left outlet and under-bed light (new value and timer)
      //state   - 0:off 1:on
      //timeout - in minutes
      var promise = $.Deferred();
      if (!bluetoothStateModel.get('hasFoundation')) {
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationSetLight(which, state, timeout);
      _log.call(this, "foundationSetLight:" + which +'-'+ state);
      MessageQueue.send(message).then(
        function(responseMessage){
          if (responseMessage.subCommand === 0x0) {
            _log.call(this, "foundationSetLight success");
            promise.resolve(responseMessage);
          } else {
            _log.call(this, "foundationSetLight error");
            promise.reject(responseMessage);
          }
        }.bind(this),
        function(response){
          _log.call(this, "foundationSetLight error:" + JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },
    foundationGetLight: function(which) {
      //which   - 1:rightStand 2:leftStand 3:rightUnder 4:leftUnder
      var promise = $.Deferred();
      if (!bluetoothStateModel.get('hasFoundation')) {
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationGetLight(which);
      _log.call(this, "foundationGetLight:" + which);
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForFoundationGetLight(responseMessage);
          //_log.call(this, "foundationGetLight:" + which + "-" + JSON.stringify(responseMessage));
          _log.call(this, "foundationGetLight:" + which + "-" + JSON.stringify(responseMessage.returnObject));
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          _log.call(this, "foundationGetLight error "+JSON.stringify(response));
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },
    foundationSetPreset: function(side, which) {
      /* 
      0x01: Custom Preset 
      0x02: Read Preset 
      0x03: Watch TV Preset 
      0x04: Flat Preset 
      0x05: Zero G Preset 
      0x06: Snore Preset
      */
      var promise = $.Deferred();
      if (!bluetoothStateModel.get('hasFoundation')) {
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationSetPreset(side, which);
      MessageQueue.send(message).then(
        function(responseMessage){
          if (responseMessage.subCommand === 0x0) {
            promise.resolve(responseMessage);
          } else {
            promise.reject(responseMessage);
          }
        }.bind(this),
        function(response){
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },
    //read preset
    //store preset
    //reset preset
    foundationSetForceIdle: function() {
      if (!bluetoothStateModel.get('hasFoundation')) {
        var promise = $.Deferred();
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationSetForceIdle();
      return MessageQueue.send(message);
    },
    foundationGetSoftwareVersion: function() {
      var promise = $.Deferred();
      if (!bluetoothStateModel.get('hasFoundation')) {
        promise.resolve();
        return promise;
      }
      var message = MessageTranslation.messageForFoundationGetSoftwareVersion();
      MessageQueue.send(message).then(
        function(responseMessage){
          responseMessage = MessageTranslation.messageDecodeForFoundationGetSoftwareVersion(responseMessage);
          promise.resolve(responseMessage);
        }.bind(this),
        function(response){
          promise.reject(response);
        }.bind(this)
      );
      return promise;
    },







    // *********************************
    // Sleep Expert
    // *********************************
    getKeyedValue: function(key) {
      var message = MessageTranslation.messageForGetKeyedValue(key);
      return MessageQueue.getKey(message);
    },

    setKeyedValue: function(key, value) {
      var message = MessageTranslation.messageForSetKeyedValue(key, value);
      return MessageQueue.setKey(message, value);
    }








  });

  function _log(var1, var2) {
    if (window.env !== 'production') {
      $('#logging').prepend('<div>'+var1+'</div>');
      console.log(var1);
      if (var2) {
        console.log(var2);
        $('#logging').prepend('<div>'+JSON.stringify(var2)+'</div>');
      }
    }
  }

  return new DeviceCommunication();
});