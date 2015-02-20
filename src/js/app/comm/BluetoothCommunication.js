// Username: s676r1@selectcomfort.com
// Password: storex12
// kelley.parker@selectcomfort.co
// password: Parkers0712

define(function(require) {
  var EventDispatcher = require('lavaca/events/EventDispatcher'),
      stateModel = require('app/models/StateModel'),
      selectComfortConstants = require('app/comm/SelectComfortConstants'),
      deviceCommunication = require('app/comm/DeviceCommunication'),
      bluetoothStateModel = require('app/comm/BluetoothStateModel'),
      $ = require('$'),
      moment = require('moment'),
      router = require('lavaca/mvc/Router'),
      messageTranslation = require('app/comm/MessageTranslation'),
      messageQueue = require('app/comm/MessageQueue');

  /*************
  Events:

  init
  initSuccess
  initError
  
  startScan
  startScanSuccess
  startScanError
  scanResult
  
  stopScan
  stopScanSuccess
  stopScanError

  connectDevice
  connectDeviceSuccess
  connectDeviceError

  discover
  discoverSuccess
  discoverError

  *************/

  var BluetoothCommunication = EventDispatcher.extend(function() {
    EventDispatcher.call(this, arguments);

    // currentState can only be: 
    // opening, opened, closing, closed
  },{
    isOpen: false,
    currentState: 'closed',
    simpleLogging: true,
    verboseLogging: true,
    outOfRangeCount: 0,


    /*************
    initialization
    *************/
    init: function() {
      var promise = $.Deferred();
      _updateState.call(this, 'init');

      if (!window.bluetoothle && !window.hasBluetoothLE) {
        _updateState.call(this, 'initError');
        promise.reject();
        return promise;
      }
      window.hasbluetoothle.check(function checkIfBTLE(hasBTLE){
        var btle = hasBTLE ? hasBTLE.status : false;
        Modernizr.noBTLE = !btle;
        $('html').toggleClass('noBTLE',!btle);
        if(btle){
          window.bluetoothle.isInitialized(function initialize(obj) {
            if (obj.isInitialized) {
              _updateState.call(this, 'initSuccess');
              promise.resolve();
            } 
            else {
              window.bluetoothle.initialize(
                function initializeSuccess(obj) {
                  if (obj.code === "100") {
                    _log.call(this, "Bluetooth initialized successfully");
                    this.initialized = true;
                    _updateState.call(this, 'initSuccess');
                    this.trigger('bt-on');
                    promise.resolve();
                  } else {
                    _log.call(this, "Unexpected initialize status: " + obj.status);
                    _log.call(this, "test " + JSON.stringify(obj));
                    _updateState.call(this, 'initError');
                    this.initialized = false;
                    this.trigger('bt-off');
                    promise.reject();
                  }
                }.bind(this), 
                function initializeError(obj) {
                  if (obj.message && (obj.message === 'Bluetooth powered off' || obj.message === 'Bluetooth not enabled' || obj.message.toLowerCase().indexOf('off') > -1)) {
                    window.customAlert.alert('Bluetooth is powered off.  To use the bed remote, turn bluetooth on.',null,'Bluetooth');
                  }
                  this.trigger('initStatusChange');
                  _log.call(this, "Initialize error: " + obj.error + " - " + obj.message, obj);
                  _updateState.call(this, 'initError');
                  this.initialized = false;
                  this.trigger('bt-off');
                  promise.reject();
                }.bind(this)
              );
            }
          }.bind(this));
        }
        else{
          promise.reject();
        }
      }.bind(this), function doesNotHaveBTLE(){
        promise.reject();
      });

      return promise;
    },


    open: function() {
      // connect, discover, subscribe, wire bind
      var promise = $.Deferred();
      if(!this.currentState || this.currentState === 'closed') {
        _updateState.call(this, 'opening');

        var address = bluetoothStateModel.get('address');
        window.bluetoothle.on('deviceDropped', _onDeviceDropped.bind(this));
        window.bluetoothle.on('characteristicValueChanged', _onCharacteristicValueChanged.bind(this));

        this.connectionTimeout = setTimeout(function() {
          _log.call(this, "connection timeout");
          this.close();
          promise.reject();
        }.bind(this), selectComfortConstants.ConnectTime * 1000);

        _log.call(this, "connecting");
        window.bluetoothle.connect(address).then(
          function success() {
            
            _log.call(this, "connected");

            window.bluetoothle.startCharacteristicNotifications(address, selectComfortConstants.SERVICE, selectComfortConstants.CHARACTERISTIC_TX).then(
              function success() {
                  
                  _log.call(this, "subscribed");
                  deviceCommunication.wireBind().then(
                    function success() {
                      
                      _log.call(this, "bound");
                      
                      deviceCommunication.proxyGetNodeList().then(
                        function success() {
                          
                          deviceCommunication.foundationGetSystemStatus().then(
                            function success() {

                              _updateState.call(this, 'opened');

                              if (!this._keepAliveInterval) {
                                this._keepAliveInterval = setInterval(_keepAlive.bind(this), selectComfortConstants.KeepAliveInterval);
                              }

                              clearTimeout(this.connectionTimeout);
                              promise.resolve();

                            }.bind(this),
                            function error() {
                              _log.call(this, "foundation status error");
                              this.close();
                              clearTimeout(this.connectionTimeout);
                              promise.reject();
                            }.bind(this));

                        }.bind(this),
                        function error() {
                          _log.call(this, "proxy node list error");
                          this.close();
                          clearTimeout(this.connectionTimeout);
                          promise.reject();
                        }.bind(this));

                      promise.resolve();

                    }.bind(this),
                    function error() {
                      _log.call(this, "bind error");
                      this.close();
                      clearTimeout(this.connectionTimeout);
                      promise.reject();
                    }.bind(this)
                  );

                }.bind(this),
                function error() {
                  _log.call(this, "subscribe error");
                  this.close();
                  clearTimeout(this.connectionTimeout);
                  promise.reject();
                }.bind(this)
              );

          }.bind(this),
          function error() {
            _log.call(this, "connect error");
            this.close();
            clearTimeout(this.connectionTimeout);
            promise.reject();
          }.bind(this)
        );


      } else {
        promise.resolve();
      }

      return promise;
    },

    close: function() {
      // disconnect, close
      var promise = $.Deferred();
      var address = bluetoothStateModel.get('address');
      _updateState.call(this, 'closing');

      window.bluetoothle.off('deviceDropped');
      window.bluetoothle.off('characteristicValueChanged');

      window.bluetoothle.stopCharacteristicNotifications(address, selectComfortConstants.SERVICE, selectComfortConstants.CHARACTERISTIC_TX);

      window.bluetoothle.disconnect(address).then(
        function disconnectSuccess() {
          _log.call(this, "disconnected");
        }.bind(this), 
        function disconnectError() {
          _log.call(this, "disconnected error");
        }.bind(this)
      );

      setTimeout(function(){
        promise.resolve();
        _updateState.call(this, 'closed');
      }.bind(this), 500);

      return promise;
    },


    /*************
    scanning
    *************/
    scan:function(){
      if (!window.bluetoothle) {
        return;
      }
      bluetoothStateModel.set('scanResults', []);

      window.bluetoothle.on('deviceAdded', _onDeviceAdded.bind(this));
      window.bluetoothle.startDiscovery();
      setTimeout(function(){
        window.bluetoothle.stopDiscovery();
        window.bluetoothle.off('deviceAdded');
      }, selectComfortConstants.ScanTime * 1000);
    },



    /*************
    signal strength
    *************/
    rssi: function() {
      if (!window.bluetoothle) {
        return;
      }
      var promise = $.Deferred();
      var address = bluetoothStateModel.get('address');

      _log.call(this, "Beginning rssi");
      window.bluetoothle.getDevice(address).then(
        function success(obj) {
          _log.call(this, "rssi completed", obj.rssi);
          this.trigger('rssi-update', {'rssi': obj.rssi});
          if (obj.rssi < selectComfortConstants.RSSIRangeLimit) {
            this.outOfRangeCount++;
            if (this.outOfRangeCount > 1) {
              _log.call(this, "rssi out of range, closing");
              this.close(); // preemptively close bad connections
            }
          } else {
            this.outOfRangeCount = 0;
          }
          promise.resolve(obj.rssi);
        }.bind(this), 
        function error(obj) {
          _log.call(this, "rssi error: " + obj.error + " - " + obj.message);
          promise.reject();
        }.bind(this)
      );

      return promise;
    }

  });


  //Private helpers
  function _updateState(state) {
    this.currentState = state;
    this.trigger('stateChange', {'state': state});
    if (this.simpleLogging) {
      console.log('bt---'+state);
    }
    if (state === 'opening' || state === 'opened') {
      this.isOpen = true;
    }
    if (state === 'opened') {
      Modernizr.setTest('ble-active-connection', true);
      bluetoothStateModel.set('isConnected', true);
    }
    if (state === 'closing' || state === 'closed') {
      this.isOpen = false;
      Modernizr.setTest('ble-active-connection', false);
      bluetoothStateModel.set('isConnected', false);
    }
  }

  function _changeConnectionState(value) {
    this.isOpen = value;
    bluetoothStateModel.set('isConnected', value);
  }

  function _keepAlive() {
    var dateDiff = moment().diff(messageQueue.lastSendDate);
    //check for radio silence
    if (_shouldPersistBLE.call(this) && (dateDiff > (100 + selectComfortConstants.KeepAliveInterval))) {
      _log.call(this, "Stayin' Alive");
      if (this.currentState === 'opened') {
        deviceCommunication.pumpGetStatus();
        this.rssi();
      } else {
        this.open();
      }
    }
  }

  function _shouldPersistBLE() {
    return bluetoothStateModel.get('shouldPersistConnection') && bluetoothStateModel.get('address') !== '';
  }

  function _attemptReconnect() {
    if (!_shouldPersistBLE.call(this)) {
      return;
    }
    _log.call(this, "attempt reconnect");
    this.open();
  }

  function _onDeviceDropped() {
    if (!stateModel.get('demoMode')) {
      this.close().then(function(){
        _log.call(this, "connectionDropped");
        if (_shouldPersistBLE.call(this)) {
          _attemptReconnect.call(this);
        }
      }.bind(this));
    }
  }

  function _onDeviceAdded(obj) {
    var uuids = obj.uuids || [];
    for (var i=0; i<uuids.length; i++) {
      if (uuids[i].toLowerCase() === selectComfortConstants.SERVICE) {
        if (!obj.rssi || obj.rssi > selectComfortConstants.RSSIRangeLimit) { //only add devices within range
          _addScanResult.call(this, obj);
        }
      }
    }
  }

  function _addScanResult(obj) {
    var currentResults = bluetoothStateModel.get('scanResults');
    if (_isUnique.call(this, currentResults, obj)) {
      _log.call(this, obj);

      // TODO REMOVE ME
      var name = obj.name || '';
      obj.macAddress = obj.name;
      name = name.toLowerCase();
      if (name === "cc:04:b4:01:00:4e" || obj.address === "370106C5-3D00-333A-A12A-176AAA099C85") {
        obj.name = "Alex Pump";
      } else if (name === "cc:04:b4:01:00:3e" || obj.address === "956E43E3-513F-739B-A62C-65FA7E073054") {
        obj.name = "David Pump";
      } else if (name === "cc:04:b4:01:32:f4" || obj.address === "955E158A-63A2-B877-4724-B709C0359C29") {
        obj.name = "David Home Pump";
      } else if (name === "cc:04:b4:01:01:2b" || obj.address === "AB77B76F-0CDE-783F-FC3D-763598B50F45") {
        obj.name = "Khai Pump";
      } else if (name === "cc:04:b4:01:07:19" || obj.address === "CAE2BFDE-0915-0531-5BFD-CBCA272369B3") {
        obj.name = "Bed Pump";
      }

      currentResults.push(obj);
      bluetoothStateModel.set('scanResults', currentResults);
      this.trigger('scanResult', {'result': obj});
    }
  }

  function _onCharacteristicValueChanged(obj) {
    _log.call(this, 'Characteristic callback', obj);
    messageTranslation.dataReceived(obj.value);
  }

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

  function _isUnique(array, obj) {
    for (var i=0; i<array.length; i++) {
      if (array[i].address === obj.address) {
        return false;
      }
    }
    return true;
  }

  return new BluetoothCommunication();
});