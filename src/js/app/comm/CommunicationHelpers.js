define(function(require) {

  var CommunicationHelpers = {

    arrayBufferToRaw: function(data) {
      var view = new DataView(data);
      var length = view.byteLength;
      var raw = new Uint8Array(length);
      for (var i=0; i<length; i++) {
        raw[i] = view.getUint8(i);
      }
      return raw;
    },
    hexToBase64: function(str) {
      return btoa(String.fromCharCode.apply(null,
        str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
      );
    },
    base64ToHex: function(str) {
      for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        var tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) {
          tmp = "0" + tmp;
        }
        hex[hex.length] = tmp;
      }
      return hex.join("");
    },
    rawToHex: function(raw) {
      var h = '';
      for (var i = 0; i < raw.length; i++) {
        h += _pad(raw[i].toString(16), 2);
      }
      return h;
    },
    hexToRaw: function(str) {
      if (typeof str === 'string') {
        var ret = new Uint8Array(Math.floor(str.length / 2));
        var i = 0;
        str.replace(/(..)/g, function(str) {
          ret[i++] = parseInt(str, 16);
        });
        return ret;
      }
    },
    stringToBytes: function(string) {
      var bytes = new ArrayBuffer(string.length * 2);
      var bytesUint16 = new Uint16Array(bytes);
      for (var i = 0; i < string.length; i++) {
        bytesUint16[i] = string.charCodeAt(i);
      }
      return new Uint8Array(bytesUint16);
    },
    bytesToString: function(bytes) {
      return String.fromCharCode.apply(null, new Uint16Array(bytes));
    },
    fletcherChecksum: function(raw) {
      var a = 0;
      var b = 0;
      for (var cnt = 0; cnt < raw.length; cnt++) {
        a = a + raw[cnt]; 
        b = b + a;
      }
      return(b);
    },
    fletcherChecksumHexToHex: function(hex) {
      var checksum = parseInt(this.fletcherChecksum(this.hexToRaw(hex)), 10);
      var raw = new Uint8Array(2);
      raw[0] = checksum >> 8;
      raw[1] = checksum & 0xff;
      return this.rawToHex(raw);
    },
    makeCRCTable: function() {
      var c;
      var crcTable = [];
      for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
          c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
      }
      return crcTable;
    },
    crc32: function(str) {
      var crcTable = this.crcTable || (this.crcTable = this.makeCRCTable());
      var crc = 0 ^ (-1);

      for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
      }
      return (crc ^ (-1)) >>> 0;
    },
    reverseRaw: function(raw) {
      var reversedRaw = new Uint8Array(raw.length);
      var j = 0;
      for (var i=raw.length-1; i>-1; i--) {
        reversedRaw[j] = raw[i];
        j++;
      }
      return reversedRaw;
    },
    advertisementBase64ContainsService: function(base64, service) {
      var hex = this.base64ToHex(base64);
      var raw = this.hexToRaw(hex);
      var reversedRaw = this.reverseRaw(raw);
      var reversedHex = this.rawToHex(reversedRaw);
      var re = new RegExp('-', 'g');
      service = service.replace(re,'');
      return reversedHex.indexOf(service) > -1;
    },
    intToRaw: function(number) {
      var raw = new Uint8Array(2);
      raw[0] = 0;
      raw[1] = number;
      return raw;
    },
    isHex: function(value) {
      return /^[a-fA-F0-9]+$/.test(value);
    },
    isHexContainedInRaw: function(hex, raw) {
      for (var i = 0; i < raw.length; i++) {
        if (raw[i] === hex) {
          return true;
        }
      }
      return false;
    },
    digitToBinary: function(number) {
      var returnValue = '0000';
      if (number < 0 || number > 9) {
        return returnValue;
      }
      returnValue = number.toString(2);
      return _pad.call(this, returnValue, 4);
    }

  };

  function _pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
  }

  return CommunicationHelpers;
});