define(function(require) {
  var EventDispatcher = require('lavaca/events/EventDispatcher'),
      SelectComfortConstants = require('app/comm/SelectComfortConstants'),
      CommunicationHelpers = require('app/comm/CommunicationHelpers'),
      Message = require('app/comm/Message'),
      contains = require('mout/array/contains'),
      $ = require('$');

  var MessageTranslation = EventDispatcher.extend(function() {
    EventDispatcher.call(this, arguments);
  },{
    simpleLogging: true,
    verboseLogging: true,


    orgID: 64341,
    dstID: 1817,


    setWireBind: function(message) {
      var raw = CommunicationHelpers.hexToRaw(message.payloadHex);
      this.orgID = raw[8] << 8 | raw[9];
      this.dstID = message.orgID;
    },
    createNewBoundMessage: function(nodeClass, command, subCommand, payload) {
      var message = new Message(nodeClass, command, this.orgID, this.dstID, subCommand, payload);
      _log.call(this, 'Bound Message', CommunicationHelpers.base64ToHex(message.base64[0]));
      return message;
    },


    // *********************************
    // Contstructing Data packets 
    // and Deconstructing packets
    // *********************************
    dataReceived: function(data) {
      var raw = CommunicationHelpers.arrayBufferToRaw(data);
      var hex = CommunicationHelpers.rawToHex(raw);

      // var hex = CommunicationHelpers.base64ToHex(data);
      // var raw = CommunicationHelpers.hexToRaw(hex);
      var expectedPayloadLength = raw[11]&0xf;
      var expectedLength = expectedPayloadLength + SelectComfortConstants.kSCMessageHdrUARTSize;
      if (hex.substring(0,4) === SelectComfortConstants.kSCMessagePreamble && raw.length === expectedLength) {
        //everything is here
        this.completeDataRecieved(hex);
      } else {
        if (hex.substring(0,4) === SelectComfortConstants.kSCMessagePreamble) {
          this.partial = hex;
        } else {
          hex = this.partial + hex;
          raw = CommunicationHelpers.hexToRaw(hex);
          expectedPayloadLength = raw[11]&0xf;
          expectedLength = expectedPayloadLength + SelectComfortConstants.kSCMessageHdrUARTSize;
          if (hex.substring(0,4) === SelectComfortConstants.kSCMessagePreamble && raw.length === expectedLength) {
            //everything is here
            this.completeDataRecieved(hex);
          }
        }
      }
    },
    completeDataRecieved: function(hex) {
      var message = new Message(hex);
      _log.call(this, 'Retreived Message', message);
      this.trigger('messageReturned', {'message': message});
    },



    // *********************************
    // Wire Bind
    // *********************************
    messageForWireBind: function() {
      // In the IOS library, this following function 
      // generated a payload, but the generated payload 
      // was always the same so this will be hard coded.
      // *****
          // CFUUIDRef cfuuid;
          // cfuuid = CFUUIDCreate(kCFAllocatorDefault);
          // CFUUIDBytes bytes = CFUUIDGetUUIDBytes(cfuuid);
          // uint64_t down = *((uint64_t*)&bytes.byte0);
          // uint64_t up   = *((uint64_t*)&bytes.byte8);
          // did = [NSNumber numberWithLongLong:(up^down)];
          // CFRelease(cfuuid);
          // [[NSUserDefaults standardUserDefaults] setObject:did forKey:kSCCDeviceID];
          // uint64_t did = [[SCCLowComms lowComms].deviceID longLongValue];
          // msg.payload = [NSData dataWithBytes:&did length:sizeof(did)];
      // *****
      var message = new Message(
        SelectComfortConstants.SCNC_MCRProxyController, //Class
        SelectComfortConstants.SCDeviceQueryRequest, //Command
        0, //orgID
        0, //dstID
        0, //subCommand
        CommunicationHelpers.hexToRaw('f1a128a151ecfb55') //payload
      );
      _log.call(this, 'Wire Bind', CommunicationHelpers.base64ToHex(message.base64[0]));

      return message;
    },







    // *********************************
    // Pump messages
    // *********************************


    // *********************************
    messageForPumpSetSleepNumber: function(side, number) {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCPSetPointChangeRequest, //Command
        side, //subCommand
        CommunicationHelpers.intToRaw(number) //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCPSetPointChangeRequestReplyLength;

      return message;
    },

    // *********************************
    messageForPumpGetStatus: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCPPumpStatusRequest, //Command
        0, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCPPumpStatusRequestReplyLength;

      return message;
    },
    messageDecodeForPumpGetStatus: function(message) {
      message.returnObject = {};
      message.returnObject.isDualChamber = message.subCommand === 1;
      message.returnObject.jobs = message.payload[0];
      message.returnObject.rightSide = message.payload[1];
      message.returnObject.leftSide = message.payload[2];
      _log.call(this, 'Pump Status: ' + message.returnObject.leftSide + ' ' + message.returnObject.rightSide);

      return message;
    },

    // *********************************
    messageForPumpGetJobStatus: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCPJobStatusRequest, //Command
        0, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCPJobStatusRequestReplyLength;

      return message;
    },

    // *********************************
    messageForPumpGetState: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCPPumpStateRequest, //Command
        0, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCPPumpStateRequestReplyLength;

      return message;
    },
    messageDecodeForPumpGetState: function(message) {
      message.returnObject = {};
      message.returnObject.isDualChamber = message.subCommand === 1;
      message.returnObject.rightSide = message.payload[1];
      message.returnObject.leftSide = message.payload[2];

      var binaryResponse = CommunicationHelpers.digitToBinary(message.payload[3]);
      message.returnObject.isActive = binaryResponse.substring(1,2) === '1';
      message.returnObject.activeSide = binaryResponse.substring(2,3) === '1'? 'left' : 'right';
      message.returnObject.pumpAction = binaryResponse.substring(3,4) === '1'? 'deflate' : 'inflate';

      _log.call(this, 'Pump State: ' + message.returnObject.leftSide + ' ' + message.returnObject.rightSide + ' ' + message.returnObject.isActive + ' ' + message.returnObject.activeSide + ' ' + message.returnObject.pumpAction);

      return message;
    },

    // *********************************
    messageForPumpSetForceIdle: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCForceIdleRequest, //Command
        0, //subCommand
        null //payload
      );

      return message;
    },
    // *********************************
    messageForPumpGetSideName: function(side) {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCNameRequest, //Command
        side, //subCommand
        null //payload
      );

      return message;
    },
    // *********************************
    messageForPumpSetSideName: function(side, name) {
      //[TODO] need to truncate name if too long

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCNameRequest, //Command
        side+1, //subCommand
        CommunicationHelpers.stringToBytes(name) //payload
      );

      return message;
    },

    // *********************************
    messageForPumpGetMemory: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCPMemoryValueRecallRequest, //Command
        0, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCPMemoryValueRecallRequestReplyLength;

      return message;
    },
    messageDecodeForPumpGetMemory: function(message) {
      message.returnObject = {};
      message.returnObject.rightSide = message.payload[0];
      message.returnObject.leftSide = message.payload[1];

      return message;
    },

    // *********************************
    messageForPumpSetMemory: function(side, number) {

      var payload = new Uint8Array(1);
      payload[0] = number;
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCPPumpStateRequest, //Command
        side, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCPPumpStateRequestReplyLength;

      return message;
    },

    // *********************************
    messageForPumpGetSoftwareVersion: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_PumpController, //Class
        SelectComfortConstants.SCSoftwareRevisionRequest, //Command
        0, //subCommand
        null //payload
      );

      return message;
    },
    messageDecodeForPumpGetSoftwareVersion: function(message) {

      message.returnObject = {};
      message.returnObject.deviceID = message.payloadHex.substr(0,16);
      message.returnObject.versionNumber = message.payloadHex.substr(16,8);
      message.returnObject.radioRevision = Number(message.payloadHex.substr(24,message.payloadHex.length));

      return message;
    },





    // *********************************
    // MCR Proxy
    // *********************************


    //Devices such as: 
    //SCNC_PumpDevice
    //SCNC_FoundationDevice
    //SCNC_SleepExpertDevice
    //SCNC_SleepExpertDevice
    //SCNC_TemperatureEngineDevice
    //SCNC_MCRProxyDevice
    //SCNC_BridgeDevice

    // *********************************
    messageForProxyGetNodeList: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_MCRProxyController, //Class
        SelectComfortConstants.SCMPStatusRequest, //Command
        0, //subCommand
        null //payload
      );

      return message;
    },
    messageDecodeForProxyGetNodeList: function(message) {

      message.returnObject = {};
      message.returnObject.hasPump = CommunicationHelpers.isHexContainedInRaw(SelectComfortConstants.SCNC_PumpDevice, message.payload);
      message.returnObject.hasFoundation = CommunicationHelpers.isHexContainedInRaw(SelectComfortConstants.SCNC_FoundationDevice, message.payload);
      message.returnObject.hasSleepExpert = CommunicationHelpers.isHexContainedInRaw(SelectComfortConstants.SCNC_SleepExpertDevice, message.payload);
      message.returnObject.hasTemperatureEngine = CommunicationHelpers.isHexContainedInRaw(SelectComfortConstants.TemperatureEngineDevice, message.payload);
      message.returnObject.hasProxy = CommunicationHelpers.isHexContainedInRaw(SelectComfortConstants.SCNC_MCRProxyDevice, message.payload);
      message.returnObject.hasBridge = CommunicationHelpers.isHexContainedInRaw(SelectComfortConstants.SCNC_BridgeDevice, message.payload);

      return message;
    },
    // *********************************
    messageForSetAddNode: function(device) { 

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_MCRProxyController, //Class
        SelectComfortConstants.SCMPChangeDeviceList, //Command
        0, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCMPChangeDeviceListReplyLength;

      return message;
    },
    // *********************************
    messageForSetRemoveNode: function(device) {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_MCRProxyController, //Class
        SelectComfortConstants.SCMPChangeDeviceList, //Command
        1, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCMPChangeDeviceListReplyLength;

      return message;
    },








    // *********************************
    // Base messages
    // *********************************


    // *********************************
    messageForFoundationSetAdjustment: function(side) {

      //var payload = new Uint8Array([0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff]);
      var payload = new Uint8Array([50,0,50,0,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0xff]);
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFAdjustmentChangeRequest, //Command
        side || 0, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFAdjustmentChangeRequestReplyLength;

      return message;
    },

    // *********************************
    messageForFoundationGetSystemStatus: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFSystemStatusRequest, //Command
        0, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFSystemStatusRequestReplyLength;

      return message;
    },
    messageDecodeForFoundationGetSystemStatus: function(message) {
      message.returnObject = {};

      message.returnObject.hasSplit = message.payload[0] !== 0;
      message.returnObject.hasDualBoard = CommunicationHelpers.digitToBinary(message.payload[3]).substring(3,4) === '1';
      message.returnObject.hasMassageAndLighting = CommunicationHelpers.digitToBinary(message.payload[3]).substring(2,3) === '1';
      message.returnObject.hasFootControl = CommunicationHelpers.digitToBinary(message.payload[3]).substring(1,2) === '1';

      return message;
    },

    // *********************************
    messageForFoundationSetPreset: function(side, which, speed) {
      /* 
      0x01: Custom Preset 
      0x02: Read Preset 
      0x03: Watch TV Preset 
      0x04: Flat Preset 
      0x05: Zero G Preset 
      0x06: Snore Preset
      */

      var payload = new Uint8Array(2);
      payload[0] = which;
      payload[1] = speed === 0 ? 0 : 1;
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFActivatePresetRequest, //Command
        side || 0, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFActivatePresetRequestReplyLength;

      return message;
    },

    // *********************************
    messageForFoundationStorePreset: function(side, which) {

      var payload = new Uint8Array(1);
      payload[0] = which;
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFStorePresetRequest, //Command
        side || 0, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFStorePresetRequestReplyLength;

      return message;
    },

    // *********************************
    messageForFoundationReadPreset: function(side, which) {

      var payload = new Uint8Array(1);
      payload[0] = which;
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFReadPresetRequest, //Command
        side || 0, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFReadPresetRequestReplyLength;

      return message;
    },

    // *********************************
    messageForFoundationResetPreset: function(side, which) {

      var payload = new Uint8Array(1);
      payload[0] = which;
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFResetPresetRequest, //Command
        side || 0, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFResetPresetRequestReplyLength;

      return message;
    },

    // *********************************
    messageForFoundationGetAdjustment: function() {
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFAdjustmentStatusRequest, //Command
        0, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFAdjustmentStatusRequestReplyLength;

      return message;
    },
    messageDecodeForFoundationGetAdjustment: function(message) {
      message.returnObject = {};
      // kSCCBaseState: @(b[0]),
      // kSCCBaseHeadPosition: @[ @(b[1]), @(b[2]) ],
      // kSCCBaseFootPosition: @[ @(b[3]), @(b[4]) ],
      // kSCCBasePositionTimeout: @[ @( b[5] | (b[6]<<8) ), @( b[7] | (b[8]<<8) ) ],
      // kSCCBaseHeadActuatorMotorStatus: @[ @(b[9]), @(b[10]) ],
      // kSCCBaseFootActuatorMotorStatus: @[ @(b[11]), @(b[12]) ],
      // kSCCBasePreset: @[ @((b[13]>>4)&0xf), @(b[13] & 0xf) ],
      // kSCCBasePresetCurrent: @[ @((b[14]>>4)&0xf), @(b[14] & 0xf) ]

      message.returnObject.state = message.payload[0];
      message.returnObject.headPosition = [message.payload[1], message.payload[2]];
      message.returnObject.footPosition = [message.payload[3], message.payload[4]];
      // message.returnObject.positionTimeout = Number('' + message.payload[3] + message.payload[4]);
      // message.returnObject.headActuatorMotorStatus = Number('' + message.payload[3] + message.payload[4]);
      // message.returnObject.footActuatorMotorStatus = Number('' + message.payload[3] + message.payload[4]);
      // message.returnObject.preset = Number('' + message.payload[3] + message.payload[4]);
      message.returnObject.presetCurrent = [Number((message.payload[14]>>4)&0xf), Number(message.payload[14]&0xf)];


      return message;
    },

    // *********************************
    messageForFoundationSetMotionHalt: function(side, stopHead, stopFoot, stopMassage) {
      
      var payload = new Uint8Array(3);
      payload[0] = stopHead ? 1 : 0xff;
      payload[1] = stopFoot ? 1 : 0xff;
      payload[2] = stopMassage ? 1 : 0xff;

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFMotionHalt, //Command
        side, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFMotionHaltReplyLength;

      return message;
    },

    // *********************************
    messageForFoundationSetLight: function(which, state, timeout) {

      var payload = new Uint8Array(3);
      payload[0] = state;
      payload[1] = timeout & 0xff;
      payload[2] = timeout >> 8;
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFOutletChangeRequest, //Command
        which || 4, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFOutletChangeRequestReplyLength;

      return message;
    },

    // *********************************
    messageForFoundationGetLight: function(which) {
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFOutletStatusRequest, //Command
        which || 4, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFOutletStatusRequestReplyLength;

      return message;
    },
    messageDecodeForFoundationGetLight: function(message) {
      
      message.returnObject = {};
      message.returnObject.isOn = Number(message.payload[0]) >= 1;
      message.returnObject.timeout = Number('' + message.payload[1] + message.payload[2]);

      return message;
    },

    // *********************************
    messageForFoundationSetForceIdle: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCForceIdleRequest, //Command
        0, //subCommand
        null //payload
      );

      return message;
    },

    // *********************************
    messageForFoundationGetSoftwareVersion: function() {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCSoftwareRevisionRequest, //Command
        0, //subCommand
        null //payload
      );

      return message;
    },
    messageDecodeForFoundationGetSoftwareVersion: function(message) {

      message.returnObject = {};
      message.returnObject.deviceID = message.payloadHex.substr(0,16);
      message.returnObject.versionNumber = message.payloadHex.substr(16,8);
      message.returnObject.radioRevision = Number(message.payloadHex.substr(24,message.payloadHex.length));

      return message;
    },

    // *********************************
    messageForFoundationGetMassage: function(side) {
      
      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_FoundationController, //Class
        SelectComfortConstants.SCFMassageStatusRequest, //Command
        side, //subCommand
        null //payload
      );

      message.expectedResponsePayloadLength = SelectComfortConstants.SCFMassageStatusRequestReplyLength;

      return message;
    },
    messageDecodeForFoundationGetMassage: function(message) {
      
      message.returnObject = {};
      message.returnObject.headMassageStatus = Number(message.payload[1]);
      message.returnObject.footMassageStatus = Number(message.payload[2]);
      message.returnObject.waveMassageStatus = Number(message.payload[3]);

      return message;
    },









    // *********************************
    // Get Expert Value
    // *********************************
    messageForGetKeyedValueShort: function(key) {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_SleepExpertController, //Class
        SelectComfortConstants.SCSEShortReadRequest, //Command
        0, //subCommand
        CommunicationHelpers.stringToBytes(key) //payload
      );

      return message;
    },

    // *********************************
    messageForGetKeyedValueLong: function(key) {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_SleepExpertController, //Class
        SelectComfortConstants.SCSELongRequest, //Command
        2, //subCommand
        CommunicationHelpers.stringToBytes(key) //payload
      );

      message.expectedResponsePayloadLength = 8;

      message.isLong = true;

      return message;
    },
    messageForGetKeyedValueLongChunk: function(seq) {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_SleepExpertController, //Class
        SelectComfortConstants.SCSELongRequest, //Command
        seq, //subCommand
        null //payload
      );

      return message;
    },
    messageDecodeForGetKeyedValueLong: function(message) {
      message.returnObject = {};
      if (message.payload.length === 8) {
        var crc = '' + message.payload[0] + message.payload[1] + message.payload[2] + message.payload[3];
        var remaining = '' + message.payload[4] + message.payload[5] + message.payload[6] + message.payload[7];
        message.returnObject.crc = parseInt(crc, 10);
        message.returnObject.remaining = parseInt(remaining, 10);
        _log.call(this, 'crc:' + crc + ' remaining:' + remaining);
      }
      return message;
    },

    // *********************************
    messageForGetKeyedValue: function(key) {
      if (contains(SelectComfortConstants.SleepExpertLongKeys, key)) {
        return this.messageForGetKeyedValueLong(key);
      } else {
        return this.messageForGetKeyedValueShort(key);
      }
    },


    // *********************************
    // Set Expert Value
    // *********************************
    messageForSetKeyedValueShort: function(key, value) {

      var payload;
      if (value instanceof Uint8Array) {
        payload = value;
      }
      if (typeof value === 'string') {
        payload = CommunicationHelpers.stringToBytes(value);
      }

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_SleepExpertController, //Class
        SelectComfortConstants.SCSEShortWriteRequest, //Command
        0, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = 0;

      return message;
    },

    // *********************************
    messageForSetKeyedValueLong: function(key, value) {

      var length = value.length;
      var crc = CommunicationHelpers.crc32(value);
      var keyBytes = CommunicationHelpers.stringToBytes(key);
      var payload = new Uint8Array(12);

      payload[0] = keyBytes[0];
      payload[1] = keyBytes[1];
      payload[2] = keyBytes[2];
      payload[3] = keyBytes[3];

      payload[4] = crc >> 24 & 0xff;
      payload[5] = crc >> 16 & 0xff;
      payload[6] = crc >> 8 & 0xff;
      payload[7] = crc & 0xff;

      payload[8]  = length >> 24 & 0xff;
      payload[9]  = length >> 16 & 0xff;
      payload[10] = length >> 8 & 0xff;
      payload[11] = length & 0xff;

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_SleepExpertController, //Class
        SelectComfortConstants.SCSELongRequest, //Command
        1, //subCommand
        payload //payload
      );

      message.expectedResponsePayloadLength = 0;

      message.isLong = true;

      return message;
    },
    messageForSetKeyedValueLongChunk: function(seq, data) {

      var message = this.createNewBoundMessage(
        SelectComfortConstants.SCNC_SleepExpertController, //Class
        SelectComfortConstants.SCSELongRequest, //Command
        seq, //subCommand
        CommunicationHelpers.stringToBytes(data) //payload
      );

      message.expectedResponsePayloadLength = 0;

      return message;
    },
    messageDecodeForSetKeyedValueLong: function(message) {
      message.returnObject = {};
      if (message.payload.length === 8) {
        var crc = '' + message.payload[0] + message.payload[1] + message.payload[2] + message.payload[3];
        var remaining = '' + message.payload[4] + message.payload[5] + message.payload[6] + message.payload[7];
        message.returnObject.crc = parseInt(crc, 10);
        message.returnObject.remaining = parseInt(remaining, 10);
        _log.call(this, 'crc:' + crc + ' remaining:' + remaining);
      }
      return message;
    },

    // *********************************
    messageForSetKeyedValue: function(key, value) {
      if (value.length > 12) {
        return this.messageForSetKeyedValueLong(key, value);
      } else {
        return this.messageForSetKeyedValueShort(key, value);
      }
    }









  });



  //Private helpers
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

  return new MessageTranslation();
});