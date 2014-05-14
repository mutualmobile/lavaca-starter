module.exports = function (grunt) {
  'use strict';

  /* server.js */
  var express = require('express'),
    util = require('util'),
    phantom = require('node-phantom'),
    LRU = require('lru-cache'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    errorhandler = require('errorhandler'),
    vhost = require('vhost'),
    livereload = require('express-livereload'),
    spdy = require('spdy'),
    fs = require('fs');

  var startServer = function (config) {
    config = config || {};
    var requester = require(config.proxyProtocol);
    var app = express();
    var hourMs = config.hourMs || 0 * 60 * 60,
      domain = config.vhost || 'localhost',
      base = config.base,
      port = config.port,
      host = config.host,
      apiPrefix = config.apiPrefix || '/api',
      basicAuth = config.basicAuth;

    function proxyRequest(request, response) {
      var postData = request.body;
      var options = {
        host: host,
        port: config.proxyPort,
        method: request.method,
        path: request.originalUrl.replace(new RegExp(apiPrefix), ''),
        headers: {}
      };
      var jsonData;
      options.headers.host = host;
      if (basicAuth) {
        options.headers.Authorization = "Basic " + new Buffer(basicAuth.username + ":" + basicAuth.password).toString("base64");
      }
      if ('POST' === request.method && typeof postData === 'object') {
        postData = JSON.stringify(postData);
      }
      var req = requester.request(options, function (res) {
        var output = '';
        console.log(options.method + ' @ ' + options.host + options.path + ' Code: ' + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          output += chunk;
        });
        res.on('end', function () {
          response
            .status(res.statusCode);
          try {
            jsonData = JSON.parse(output);
          } catch (e) {
            jsonData = null;
          }
          if (typeof jsonData === 'object') {
            response.json(jsonData);
          } else {
            response.send(output);
          }
        });
      });

      req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
      });

      if ('POST' === request.method) {
        req.write(postData);
      }

      req.end();
    }

    config.compress && app.use(compression());
    app.all(apiPrefix + '*', proxyRequest);
    app.use(bodyParser());
    app.use(errorhandler({dumpExceptions: true, showStack: true}));
    
    if (config.preRender) {
      if (config.preRender.cache) {
        var cache = LRU({
          max: config.preRender.cache.size // number of pages to cache
        });
      }

      phantom.create(function (err, ph) {
        app.get('/*', function (request, response) {
          if ((request.url == '/') || (request.url == '/index.html')) {
            if (request.headers['user-agent'].indexOf('PhantomJS') !== -1) {
              response.sendfile(base + '/index.html');
            } else {
              getThroughPhantom(true);
            }
            return;
          }
          response.sendfile(base + request.url, {maxAge: hourMs}, getThroughPhantom);

          function getThroughPhantom(error) {
            if (!error) {
              return;
            }
            if (cache) {
              var cached = cache.get(request.url);
              if (cached) {
                response.status(200);
                response.send(cached);
                return;
              }
            }

            ph.createPage(function (err, page) {
              var url = request.protocol + '://' + request.headers.host + '/#' + request.url;
              var outputPage = function () {
                page.evaluate((function () {
                  return document.documentElement.outerHTML;
                }), function (err, result) {
                  links.length && response.setHeader('Link', links);
                  cache && cache.set(request.originalUrl, result);
                  response.status(200);
                  response.send(result);
                  clearTimeout(timeout);
                  page.close();
                  return ph;
                });
              };

              page.onCallback = function (data) {
                if (data.event && data.event == 'enterComplete') {
                  outputPage();
                }
              };

              // Add resource hinting.
              var links = [];
              page.onResourceReceived = function(resourceRequest) {
                if (resourceRequest.id == 1 || resourceRequest.stage != 'end') {
                  return;
                }
                links.push('<' + resourceRequest.url + '>; rel=subresource');
              }

              var timeout = setTimeout(outputPage.bind(this), 10000); // timeout in 10 seconds

              return page.open(url, function (err, status) {
                //console.log('open', url, status);
                err && console.log('page.open error:', err);
              });
            });
          }
        });
        listenUp();
      }, {parameters:{'ignore-ssl-errors':'yes'}}); // ! phantom.create
    } else {
      // dev mode.
      app.use(express.static(base, {maxAge: hourMs}));
      app.get('/*', function (req, res) {
        res.redirect(util.format('/#%s#', req.originalUrl));
      });
      listenUp();
    }

    config.livereload && livereload(app, {watchDir: base});

    function listenUp() {
      if (domain) {
        app.use(vhost(domain, app));
      }

      if (config.ssl) {
        var spdyOptions = {
          key: fs.readFileSync(config.ssl.key),
          cert: fs.readFileSync(config.ssl.cert),
          ca: fs.readFileSync(config.ssl.ca)
        };
        var spdyServer = spdy.createServer(spdyOptions, app);
        spdyServer.listen(config.ssl.port);
        console.log('SPDY server running at %s:%d', domain, config.ssl.port);
        // set up a route to redirect http to https
        var httpServer = express();
        httpServer.use('*', function(req,res){
          res.redirect('https://' + req.headers.host + (config.ssl.port == 443 ? '' : ':' + config.ssl.port) + req.url)
        });
        domain && httpServer.use(vhost(domain, httpServer));
        httpServer.listen(port);
        console.log('Express forwarder running at %s:%d', domain, port);
      } else {
        app.listen(port);
        console.log('Express server running at %s:%d', domain, port);
      }
    }

    return app;
  };

  grunt.registerMultiTask('server', 'Runs a static web and proxy server', function () {
    var options = this.options({});
    var app = startServer({
        host: options.apiBaseUrl, // override this with your third party API host, such as 'search.twitter.com'.
        hourMs: 0 * 60 * 60,
        vhost: options.vhost,
        base: options.base,
        port: options.port,
        apiPrefix: options.apiPrefix,
        proxyPort: options.proxyPort || '80',
        proxyProtocol: options.proxyProtocol || 'http',
        preRender: options.preRender,
        compress: options.compress,
        livereload: options.livereload,
        ssl: options.ssl
      }),
      args = this.args,
      done = args[args.length - 1] === 'watch' ? function () {
      } : this.async();
    app.on('close', done);
  });

};
