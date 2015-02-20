define(function(require) {

  var Disposable = require('lavaca/util/Disposable'),
      Config = require('app/env/Config'),
      hash = require('app/utils/hash'),
      $ = require('$'),
      interpolate = require('mout/string/interpolate'),
      merge = require('mout/object/merge');

  var Service = Disposable.extend(function Service() {
    Disposable.apply(this);
    this._USEMOCK = false;
    this.isAttemptingLogin = false;
    this.loginDeferred = $.Deferred();
  }, {
    /**
     * The key key that will be used to load the API URL
     * from the Config object.
     * @property apiURLKey
     * @default 'api_url'
     *
     * @type String
     */
    apiURLKey: 'api_url',
    proxyURLKey: 'proxy_url',
    /**
     * The key that will be used to load the mock URL
     * from the Config object.
     * @property mockURLKey
     * @default 'mock_url'
     *
     * @type String
     */
    mockURLKey: 'mock_url',
    /**
     * The key that will be used to load the artificial delay value
     * (in milliseconds) from the Config object. Artificial network
     * delays will only be applied to mock requests and are
     * intended to simulate latency.
     * @property artificialDelayKey
     * @default 'artificial_network_delay'
     *
     * @type String
     */
    artificialDelayKey: 'artificial_network_delay',
    defaultAjaxOptions: {},
    /**
     * Makes a service request and returns a promise that will be
     * resolved with the data if the request succeeds.
     * @method makeRequest
     *
     * @param {String} endpoint  The value to substitute into the url string
     * @param {Object} params  A hash of data to send along with the request
     * @param {String} type  (Optional) Type of request (GET, POST, etc). Defaults to GET.
     * @return {Promise}  A promise
     */
    /**
     * Makes a service request and returns a promise that will be
     * resolved with the data if the request succeeds. To use mock
     * data, pass true for the first parameter.
     * @method makeRequest
     *
     * @param {Boolean} useMock  True if the mock url should be used
     * @param {String} endpoint  The value to substitute into the url string
     * @param {Object} params  A hash of data to send along with the request
     * @param {String} type  (Optional) Type of request (GET, POST, etc). Defaults to GET.
     * @return {Promise}  A promise
     */
    makeRequest: function(useMock, endpoint, params, type, skipAuth) {
      var backupParams = {
        useMock: useMock,
        endpoint: endpoint,
        params: params,
        type:type,
        skipAuth:skipAuth
      };
      if (typeof useMock !== 'boolean') {
        type = params;
        params = endpoint;
        endpoint = useMock;
        useMock = false;
      }
      else if(useMock){
        skipAuth = true;
      }

      var ignore_k = endpoint.indexOf('wifi') >= 0 ||endpoint.indexOf('login') >= 0 || endpoint.indexOf('&_k') >= 0 || endpoint.indexOf('?_k') >= 0;
      return _checkAuth.call(this, skipAuth).then(function(response){
        this.loginDeferred = $.Deferred();
        if(ignore_k){
          if(response && response.key){
            var index = endpoint.indexOf('_k');
            if(index > -1){
              endpoint = endpoint.slice(0,index+3) + response.key;
            }
          }
        }
        var artificialDelay = Config[this.artificialDelayKey],
            proxyUrl = interpolate(Config[this.proxyURLKey], [endpoint], /\{([^}])\}/g),
            url = interpolate(Config[useMock ? this.mockURLKey : this.apiURLKey], [endpoint], /\{([^}])\}/g),
            data;

        if (this.overrideURL && !useMock) {
          url = interpolate(this.overrideURL, [endpoint], /\{([^}])\}/g);
        }
        if (typeof useMock !== 'boolean') {
          type = params;
          params = endpoint;
          endpoint = useMock;
          useMock = false;
        }

        params = params || {};
        // params.url = url;
        type = useMock ? 'GET' : type || 'GET';

        if (type === 'GET') {
          data = params;
        } else {
          data = JSON.stringify(params);
        }

        // check for connection

  /*********** V3 connectivity seems to be broken ATM ***********/

        // if (Connectivity.isOffline()) {
        //   if (!this.offlineNotified) {
        //     
        //     window.customAlert.alert('A network error has occurred. Please check your network connection and try again.');
        //     this.offlineNotified = true;
        //     setTimeout(function() { // avoid multiple alerts
        //       this.offlineNotified = false;
        //     }.bind(this), 500);
        //   }
        //   return Promise.reject();
        // } else {
        // this.offlineNotified = false;
        var dataHash,
        ajaxOptions = merge({}, this.defaultAjaxOptions, {
          url: url,
          dataType: params.dataType || 'json',
          type: type,
          data: data,
          contentType: params.contentType || 'application/json',
          processData: type === 'GET',
          dataFilter: function(data, type) {
            // An empty string is technically invalid JSON
            // so jQuery will fail to parse it and our promise
            // will get rejected unless we first convert
            // it to valid JSON
            if (data === '' && type === 'json') {
              return 'null';
            }
            dataHash = hash(data);
            return data;
          },
          xhrFields: {
            "withCredentials": true
          },
          success: function(response, status) {
            if (status === 'success') {
              if (useMock && artificialDelay) {
                setTimeout(function() {
                  return Promise.resolve(response, dataHash);
                }, artificialDelay);
              } else {
                return Promise.resolve(response, dataHash);
              }
            } else {
              return Promise.reject(response);
            }
          },
          error: function(err, timeout) {
            var args = Array.prototype.slice.call(arguments, 0);
            if (timeout === "timeout" && !this.isShowingAlert) {
              this.isShowingAlert = true;
              var message = 'Something went wrong. Please try again later.';
              (navigator && navigator.notification)
                ? navigator.notification.alert(message, null, 'Error')
                : alert(message);

              setTimeout(function() {
                this.isShowingAlert = false;
              }.bind(this), 5000);
            }
            if (useMock && artificialDelay) {
              setTimeout(function() {
                return Promise.reject(args);
              }, artificialDelay);
            } else {
              return Promise.reject(args);
            }
          }.bind(this),
          timeout: 30000
        }),
        ajax = $.ajax(ajaxOptions);

        ajax.error(function(){
          ajax.abort();
        });
        return ajax.then(function(response) {
            if (response && response.result && response.result === 'ERROR') {
              return new Error('Error in API Call');
            }
            else {
              return response;
            }
        }.bind(this), function(response) {
            response = response || new Error('Error in API Call');
            /* If the user has the app open for an extended period of time, it is possible for them to get a 401 due to expiring cookies
               this check is in place to reauthenticate the logged in user and remake all the calls based on the loginDeferred being resolved*/
            if(response && response.status && response.status === 401){
              _received401.call(this);
              if(backupParams.endpoint === 'login'){
                return response;
              }
              return this.makeRequest(backupParams.useMock, backupParams.endpoint, backupParams.params, backupParams.type, backupParams.skipAuth).then(function(response) {
                return response;
              }, function(response) {
                return response;
              });
            }
            else{
              return response;
            }
        }.bind(this));
      }.bind(this));
    }
  });

  function _checkAuth(skipAuth){
    return this.loginDeferred.resolve();
  }

  return Service;
});
