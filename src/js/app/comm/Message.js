define(function(require) {
  var Disposable = require('lavaca/util/Disposable'),
      SelectComfortConstants = require('app/comm/SelectComfortConstants'),
      CommunicationHelpers = require('app/comm/CommunicationHelpers'),
      $ = require('$');

  /**
   * Message Class
   * @class app.comm.Message
   * @extends lavaca.util.Disposable
   *
   * @constructor
   * @param {String} [hex] hex string to decode into a message
   *
   * @constructor
   * @param {hex} [nodeClass] nodeClass as a hex value
   * @param {hex} [command] command as a hex value
   * @param {Number} [orgID] The orgID for this wire bound device
   * @param {Number} [dstID] The dstID for this wire bound device
   * @param {Number} [subCommand] Sub Command
   * @param {Uint8Array} [payload] The raw payload to send in bytes
   *
   *
   */
  var Message = Disposable.extend(function(nodeClass, command, orgID, dstID, subCommand, payload) {
      Disposable.call(this, arguments);

      if (nodeClass && nodeClass.length > 5 && CommunicationHelpers.isHex(nodeClass)) {
        this.initFromHex(nodeClass);
      } else if (
        typeof command !== 'undefined' && 
        typeof orgID !== 'undefined' && 
        typeof dstID !== 'undefined' && 
        typeof subCommand !== 'undefined' 
      ) {
        this.srcNodeClass = nodeClass;
        this.orgNodeClass = nodeClass;
        this.command = command;
        this.srcID = orgID;
        this.dstID = dstID;
        this.orgID = orgID;
        this.subCommand = subCommand;
        if (payload instanceof Uint8Array) {
          this.payload = payload;
        }
        this.generateSendData();
      }

    },{
      verboseLogging: true,

      srcNodeClass: '',
      srcID:        '',
      dstID:        '',
      orgNodeClass: '',
      orgID:        '',
      command:      '',
      subCommand:   '',
      payload:      '',

      srcNodeClassHex: '',
      srcIDHex:        '',
      dstIDHex:        '',
      orgNodeClassHex: '',
      orgIDHex:        '',
      commandHex:      '',
      subCommandHex:   '',
      payloadHex:      '',

      base64: [],
      hex: [],

      initFromHex: function(hex) {
        var raw = CommunicationHelpers.hexToRaw(hex);

        // perform checksum to verify
        if (hex.substring(0,4) === SelectComfortConstants.kSCMessagePreamble) {
          // This is a uart packet.
          var cs = hex.substring(hex.length-4, hex.length); // save checksum
          // verify checksum
          var ccs = CommunicationHelpers.fletcherChecksumHexToHex(hex.substring(4, hex.length-4));
          if (cs !== ccs) {
            _log.call(this, 'Checksum failed, discarding message.');
            return;
          }
        }

        var expectedPayloadLength = raw[11]&0xf;

        this.srcNodeClass = raw[2];
        this.srcID = (raw[3] << 8) | raw[4];
        this.dstID = (raw[5] << 8) | raw[6];
        this.orgNodeClass = raw[5];
        this.orgID = (raw[8] << 8) | raw[9];
        this.command = raw[10];
        this.subCommand = (raw[11] >> 4);

        this.srcNodeClassHex = hex.substring(4,6);
        this.srcIDHex =        hex.substring(6,10);
        this.dstIDHex =        hex.substring(10,14);
        this.orgNodeClassHex = hex.substring(14,16);
        this.orgIDHex =        hex.substring(16,20);
        this.commandHex =      hex.substring(20,22);
        this.subCommandHex =   hex.substring(22,24);

        this.payload = new Uint8Array(expectedPayloadLength);
        for (var i=0; i<expectedPayloadLength; i++) {
          this.payload[i] = raw[i + 12];
        }
        this.payloadHex = CommunicationHelpers.rawToHex(this.payload);
      },

      toRaw: function() {
        var payloadLength = 0;
        if (this.payload) {
          payloadLength = this.payload.length > 15 ? 15 : this.payload.length;
        }
        var raw = new Uint8Array(10 + payloadLength);
        
        raw[0] = this.srcNodeClass;
        raw[1] = (this.srcID >> 8) & 0xff;
        raw[2] = this.srcID & 0xff;
        raw[3] = (this.dstID >> 8) & 0xff;
        raw[4] = this.dstID & 0xff;
        raw[5] = this.orgNodeClass;
        raw[6] = (this.orgID >> 8) & 0xff;
        raw[7] = this.orgID & 0xff;
        raw[8] = this.command;
        
        if (this.payload) {
          raw[9] = ((this.subCommand & 0xf) << 4) | (payloadLength & 0xf);
          for (var i=0; i<payloadLength; i++) { //push only 15 because that is the max length
            raw[10+i] = this.payload[i];
          }
        } else {
          raw[9] = ((this.subCommand & 0xf) << 4) | (0 & 0xf);
        }
        
        return raw;
      },


      toHex: function() {
        return CommunicationHelpers.rawToHex(this.toRaw());
      },


      generateSendData: function() {
        var data = this.toHex();
        var checksum = CommunicationHelpers.fletcherChecksumHexToHex(data);
        var hexToSend = SelectComfortConstants.kSCMessagePreamble + data + checksum;
        var hexPartial;
        this.base64 = [];
        this.hex = [];

        if (hexToSend.length > (20 * 2)) {
          hexPartial = hexToSend.substring(0, (20 * 2));
          this.hex.push(hexPartial);
          this.base64.push(CommunicationHelpers.hexToBase64(hexPartial));
          hexPartial = hexToSend.substring((20 * 2), hexToSend.length);
          this.hex.push(hexPartial);
          this.base64.push(CommunicationHelpers.hexToBase64(hexPartial));
        } else {
          this.hex.push(hexToSend);
          this.base64.push(CommunicationHelpers.hexToBase64(hexToSend));
        }
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

    return Message;

  });