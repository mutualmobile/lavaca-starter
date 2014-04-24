module.exports = function(grunt) {
  'use strict';

  /* server.js */
  var express = require('express'),
    util = require('util'),
    phantom = require('phantom'),
    portscanner = require('portscanner');

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

    server.use(express['static'](base, {maxAge: hourMs}));
    server.use(express.directory(base, {icons: true}));
    server.use(express.bodyParser());
    server.use(express.errorHandler({dumpExceptions: true, showStack: true}));

    server.all(apiPrefix + '*', proxyRequest);

    server.all(/^\/[^\.]+$/, function(request, response){
      // TODO: implement caching.
      portscanner.findAPortNotInUse(40000, 60000, 'localhost', function(err, freeport) {
        phantom.create({'port': freeport}, function(ph){
          return ph.createPage(function(page) {
            var url = 'http://' + request.headers.host + '/#' + request.originalUrl;
            console.log('open', url);
            return page.open(url, function(status) {

              setTimeout(function(){
                var thisPage = page.evaluate((function() {
                  window.addEventListener('enterComplete', function(){
                    console.log('enterComplete');
                  });
                  return document.documentElement.outerHTML;
                }), function(result) {
                  //html = result;
                  response.status(200);
                  response.send(result);
                  return ph.exit();
                });
                return thisPage;
              }.bind(this), 500);
            });
          });
        }); // ! phantom.create
      });
    });

 
    server.get('/*', function(req, res) {
      res.redirect(util.format('/#%s#', req.originalUrl));
    });

    if (vhost) {
      server.use(express.vhost(vhost, server));
    }

    server.listen(port);
    return server;
  };


  grunt.registerMultiTask('server', 'Runs a static web and proxy server', function() {
    var options = this.options({
    });
    var server = startServer({
        host: options.apiBaseUrl, // override this with your third party API host, such as 'search.twitter.com'.
        hourMs: 0*60*60,
        vhost: options.vhost,
        base: options.base,
        port: options.port,
        apiPrefix: options.apiPrefix,
        proxyPort: options.proxyPort || '80',
        proxyProtocol: options.proxyProtocol || 'http'
    }),
    args = this.args,
    done = args[args.length-1] === 'watch' ? function() {} : this.async();

    server.on('close', done);

    console.log('Express server running at %s:%d', options.vhost, options.port);
  });

};
