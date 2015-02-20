define(function(require) {
  var EventDispatcher = require('lavaca/events/EventDispatcher'),
      MessageTranslation = require('app/comm/MessageTranslation'),
      selectComfortConstants = require('app/comm/SelectComfortConstants'),
      CommunicationHelpers = require('app/comm/CommunicationHelpers'),
      bluetoothStateModel = require('app/comm/BluetoothStateModel'),
      $ = require('$');

  var MessageQueue = EventDispatcher.extend(function() {
    EventDispatcher.call(this, arguments);
    this.queue = [];

    this.responseQueueID = 0;
    this.responseQueue = [];
    this.inProcess = false;

    this.streamQueueID = 0;
    this.streamQueue = [];
    MessageTranslation.on('messageReturned', _messageReturned.bind(this));
  },{
    verboseLogging: true,

    send: function(message) {
      var i = this.responseQueueID;
      message.responseQueueID = i;
      this.responseQueue[i] = {
        returnPromise: $.Deferred(),
        message: message
      };

      _log.call(this, 'Send Message', message);

      this.queue.push(message);

      if (!this.inProcess) { // serialize
        _processQueue.call(this);
      }

      _cycleResponseQueueID.call(this);
      return this.responseQueue[i].returnPromise;
    },
    getKey: function(message) {
      if (message.isLong) {
        this.streamInProcess = true;

        //setup stream tracking
        var i = this.streamQueueID;
        this.streamQueue[i] = {
          returnPromise: $.Deferred(),
          dataStream: ''
        };

        //begin stream
        this.send(message).then(
          function(response){
            var header = MessageTranslation.messageDecodeForGetKeyedValueLong(response);
            this.streamQueue[i].message = header;
            _getStreamChunk.call(this, i, header.returnObject.crc, header.returnObject.remaining, 0xc);
          }.bind(this),
          function(response){
            _failedStream.call(this, i, response);
          }.bind(this)
        );
        
        _cycleStreamQueueID.call(this);
        return this.streamQueue[i].returnPromise;
      } else {
        return this.send(message);
      }
    },
    setKey: function(message, data) {
      if (message.isLong) {
        this.streamInProcess = true;

        //setup stream tracking
        var i = this.streamQueueID;
        this.streamQueue[i] = {
          returnPromise: $.Deferred(),
          dataStream: data
        };

        //begin stream
        this.send(message).then(
          function(){
            _setStreamChunk.call(this, i, 0x9);
          }.bind(this),
          function(response){
            _failedStream.call(this, i, response);
          }.bind(this)
        );
        
        _cycleStreamQueueID.call(this);
        return this.streamQueue[i].returnPromise;
      } else {
        return this.send(message);
      }
    },
    dispose: function() {
      return EventDispatcher.prototype.dispose.apply(this, arguments);
    }

  });

  //Private helpers
  function _cycleResponseQueueID() {
    this.responseQueueID++;
    if (this.responseQueueID > 50) { //rotate IDs
      this.responseQueueID = 0;
    }
  }

  function _cycleStreamQueueID() {
    this.streamQueueID++;
    if (this.streamQueueID > 1000) { //rotate IDs
      this.streamQueueID = 0;
    }
  }

  function _sendComplete() {
    this.inProcess = false;
    _processQueue.call(this);
  }
  function _streamComplete() {
    this.streamInProcess = false;
  }

  function _failedStream(id, reason) {
    _log.call(this, 'Failed Stream', reason);
    this.streamQueue[id].returnPromise.reject(reason);
    this.streamQueue[id].message = null;
    _streamComplete.call(this);
  }

  function _failedResponse(message, reason) {
    _log.call(this, 'Failed Response', reason);
    var id = message.responseQueueID;
    // if (message.sendCount < 2) {
    //   _sendMessage.call(this, message);
    // } else {
      this.responseQueue[id].returnPromise.reject(reason);
      this.responseQueue[id].message = null;
      _sendComplete.call(this);
    //}
  }

  function _processQueue() {
    if (this.queue.length > 0) {

      this.lastSendDate = new Date();
      
      this.inProcess = true;

      //get the message
      var message = this.queue.shift();
      message.sendCount = 0;
      _sendMessage.call(this, message);

    }
  }

  function _sendMessage(message) {
    message.sendCount++;
    this.currentResponseQueueID = message.responseQueueID;

    //send the first segment
    var address = bluetoothStateModel.get('address');
    window.bluetoothle.writeCharacteristicValue(address, selectComfortConstants.SERVICE, selectComfortConstants.CHARACTERISTIC_RX, CommunicationHelpers.hexToRaw(message.hex[0]).buffer).then(
      function success() {
        //send success
      }.bind(this),
      function error() {
        _failedResponse.call(this, message, 'Failed to Send');
      }.bind(this)
    );
    if (message.base64.length > 1) {
      //send the second segment after a set delay
      setTimeout(function() {
        var address = bluetoothStateModel.get('address');
        window.bluetoothle.writeCharacteristicValue(address, selectComfortConstants.SERVICE, selectComfortConstants.CHARACTERISTIC_RX, CommunicationHelpers.hexToRaw(message.hex[1]).buffer).then(
          function success() {
            //send success
          }.bind(this),
          function error() {
            _failedResponse.call(this, message, 'Failed to Send Second Part');
          }.bind(this)
        );
      }.bind(this), selectComfortConstants.kSCMessageSegmentGap);
    }
    
    //if timeout is met, then we are never getting a message back
    setTimeout(function() { 
      if (this.responseQueue && 
          message && 
          message.responseQueueID && 
          this.responseQueue[message.responseQueueID] &&
          this.responseQueue[message.responseQueueID].message &&
          this.responseQueue[message.responseQueueID].returnPromise) {
          _failedResponse.call(this, message, 'Timeout');
      }
    }.bind(this), selectComfortConstants.kSCMessageShortTimeout * 1000);

  }

  function _messageReturned(e) {
    _log.call(this, 'subscribe response', e);
    var messageReply = e.message || {};
    var message = this.responseQueue[this.currentResponseQueueID].message;
    var isReplyValid = message.command + 0x80 === messageReply.command || message.command === 0;
    var isLengthValid = (typeof message.expectedResponsePayloadLength === 'number' && messageReply.payload.length === message.expectedResponsePayloadLength) || typeof message.expectedResponsePayloadLength !== 'number';
    if (isReplyValid && isLengthValid) { //validate
      this.responseQueue[this.currentResponseQueueID].returnPromise.resolve(messageReply);
      this.responseQueue[this.currentResponseQueueID].message = null;
      _sendComplete.call(this);
    } else {
      console.log("message:" + JSON.stringify(message));
      console.log("messageReply:" + JSON.stringify(messageReply));
      console.log('Invalid Response: length-'+isLengthValid+' reply-'+isReplyValid);
      _failedResponse.call(this, message, 'Invalid Response: length-'+isLengthValid+' reply-'+isReplyValid);
    }
  }

  function _getStreamChunk(i, crc, remaining, seq) {
    var message = MessageTranslation.messageForGetKeyedValueLongChunk(seq);
    this.send(message).then(
      function success(response) {
        // [TODO] validations

        this.streamQueue[i].dataStream += response.payloadHex;
        remaining = remaining - response.payload.length;

        /* makes more sense to check for remaining, but this seems to not always work remaining >= 0 */
        if (response.payload.length === 15) { //not done
          var nseq = seq + 1;
          if (nseq > 0xe) {
              nseq = 0xc;
          }
          _getStreamChunk.call(this, i, crc, remaining, nseq);
        } else { //done
          var atobResponse = atob(CommunicationHelpers.hexToBase64(this.streamQueue[i].dataStream));
          _log.call(this, atobResponse);
          this.streamQueue[i].returnPromise.resolve(atobResponse);
          _streamComplete.call(this);
        }
      }.bind(this),
      function error(response) {
        _log.call(this, 'Lost a packet');
        _failedStream.call(this, i, response);
      }.bind(this)
    );
  }

  function _setStreamChunk(i, seq) {
    var chunk = this.streamQueue[i].dataStream.substring(0, 15);
    _log.call(this, 'chunk: ' + chunk);
    var message = MessageTranslation.messageForSetKeyedValueLongChunk(seq, chunk);
    this.send(message).then(
      function success() {
        // [TODO] validations

        /* makes more sense to check for remaining, but this seems to not always work remaining >= 0 */
        if (chunk.length === 15) { //not done
          this.streamQueue[i].dataStream = this.streamQueue[i].dataStream.substring(15, this.streamQueue[i].dataStream.length);
          var nseq = seq + 1;
          if (nseq > 0xb) {
              nseq = 0x9;
          }
          _setStreamChunk.call(this, i, nseq);
        } else { //done
          _log.call(this, 'stream send done');
          this.streamQueue[i].returnPromise.resolve();
          _streamComplete.call(this);
        }
      }.bind(this),
      function error(response) {
        _log.call(this, 'Lost a packet');
        _failedStream.call(this, i, response);
      }.bind(this)
    );
  }

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

  return new MessageQueue();
});