module.exports = function(grunt) {
  'use strict';

  /* server.js */
  var express = require('express'),
    util = require('util'),
    phantom = require('node-phantom'),
    LRU = require('lru-cache');

  var startServer = function(config) {
    config = config || {};
    var requester = require(config.proxyProtocol);
    var server = express();
    var hourMs = config.hourMs || 0*60*60,
        vhost = config.vhost || 'localhost',
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
      var req = requester.request(options, function(res) {
        var output = '';
        console.log(options.method + ' @ ' + options.host + options.path + ' Code: '+ res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          output += chunk;
        });
        res.on('end', function() {
          response
            .status(res.statusCode);
          try {
            jsonData = JSON.parse(output);
          } catch(e) {
            jsonData = null;
          }
          if (typeof jsonData === 'object') {
            response.json(jsonData);
          } else {
            response.send(output);
          }
        });
      });

      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

      if ('POST' === request.method) {
        req.write(postData);
      }

      req.end();
    }

    //server.use(express.logger());
    config.compress && server.use(express.compress());

    if (config.staticEmulation) {
      if (config.staticEmulation.cache) {
        var cache = LRU({
          max: config.staticEmulation.cache.size // number of pages to cache
        });
      }

      phantom.create(function(err, ph) {
        server.get(/^\/[^\.]*$/, function(request, response) {
          ph.createPage(function(err,page) {
            if (request.url == '/' && request.headers['user-agent'].indexOf('PhantomJS') !== -1) {
              response.status(200);
              response.sendfile(base + '/index.html');
              return;
            }
            console.log('req to phantom', request.url);
            if (cache) {
              var cached = cache.get(request.originalUrl);
              if (cached) {
                console.log('response from cache.');
                response.status(200);
                response.send(cached);
                return;
              }
            }
            var url = request.protocol + '://' + request.headers.host + '/#' + request.url;
            var outputPage = function() {
              page.evaluate((function() {
                return document.documentElement.outerHTML;
              }), function(err, result) {
                cache && cache.set(request.originalUrl, result);
                response.status(200);
                response.send(result);
                clearTimeout(timeout);
                return ph.exit();
              });
            };

            page.onCallback = function(data) {
              if (data.event && data.event == 'enterComplete') {
                outputPage();
              }
            };
            var timeout = setTimeout(outputPage.bind(this), 10000); // timeout in 10 seconds

            return page.open(url, function(err, status) {
              console.log('open', url, status);
            });// ! server.get()
          });
          otherServers();
        });
      }); // ! phantom.create
    } else {
      // dev mode.
      server.get(/^\/[^\.]*$/, function(req, res) {
        res.redirect(util.format('/#%s#', req.originalUrl));
      });
      otherServers();
    }

    function otherServers() {
      server.use(express.static(base, {maxAge: hourMs}));
      //server.use(express.directory(base, {icons: true}));
      server.use(express.bodyParser()); // TODO: Protect agains exploit: http://andrewkelley.me/post/do-not-use-bodyparser-with-express-js.html
      server.use(express.errorHandler({dumpExceptions: true, showStack: true}));

      server.all(apiPrefix + '*', proxyRequest);

      if (vhost) {
        server.use(express.vhost(vhost, server));
      }

      server.listen(port);
    }

    return server;
  };

  grunt.registerMultiTask('server', 'Runs a static web and proxy server', function() {
    var options = this.options({});
    var server = startServer({
        host: options.apiBaseUrl, // override this with your third party API host, such as 'search.twitter.com'.
        hourMs: 0*60*60,
        vhost: options.vhost,
        base: options.base,
        port: options.port,
        apiPrefix: options.apiPrefix,
        proxyPort: options.proxyPort || '80',
        proxyProtocol: options.proxyProtocol || 'http',
        staticEmulation: options.staticEmulation,
        compress: options.compress
    }),
    args = this.args,
    done = args[args.length-1] === 'watch' ? function() {} : this.async();

    server.on('close', done);

    console.log('Express server running at %s:%d', options.vhost, options.port);
  });

};
