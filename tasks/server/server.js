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
    livereload = require('express-livereload');

  var startServer = function (config) {
    config = config || {};
    var requester = require(config.proxyProtocol);
    var server = express();
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

    config.compress && server.use(compression());
    server.use(bodyParser()); // TODO: Protect agains exploit: http://andrewkelley.me/post/do-not-use-bodyparser-with-express-js.html
    server.use(errorhandler({dumpExceptions: true, showStack: true}));

    if (config.preRender) {
      if (config.preRender.cache) {
        var cache = LRU({
          max: config.preRender.cache.size // number of pages to cache
        });
      }

      phantom.create(function (err, ph) {
        server.get('/*', function (request, response) {
          if ((request.url == '/') || (request.url == '/index.html')) {
            if (request.headers['user-agent'].indexOf('PhantomJS') !== -1) {
              response.sendfile(base + '/index.html');
            } else {
              console.log('trying to get through phantom.');
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
              var cached = cache.get(request.originalUrl);
              if (cached) {
                console.log('response from cache.');
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
              var timeout = setTimeout(outputPage.bind(this), 10000); // timeout in 10 seconds

              return page.open(url, function (err, status) {
                //console.log('open', url, status);
              });
            });
          }
        });
        listenUp();
      }); // ! phantom.create
    } else {
      // dev mode.
      server.use(express.static(base, {maxAge: hourMs}));
      server.get('/*', function (req, res) {
        res.redirect(util.format('/#%s#', req.originalUrl));
      });
      listenUp();
    }

    config.livereload && livereload(server, {watchDir: base});

    function listenUp() {
      if (domain) {
        server.use(vhost(domain, server));
      }
      server.listen(port);
      console.log('Express server running at %s:%d', domain, port);
    }

    return server;
  };

  grunt.registerMultiTask('server', 'Runs a static web and proxy server', function () {
    var options = this.options({});
    var server = startServer({
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
        livereload: options.livereload
      }),
      args = this.args,
      done = args[args.length - 1] === 'watch' ? function () {
      } : this.async();

    server.on('close', done);
  });

};
