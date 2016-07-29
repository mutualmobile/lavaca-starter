/*
 * Reads all module names and ids from the main webpack options.output.filename
 * asset and exposes `window.webpackModuleMap` to allow using
 * __webpack_require__ by module name rather than (integer) id. Intended for
 * DevTools console use.
 */
var path = require('path');
var ConcatSource = require('webpack/lib/ConcatSource');

function DynamicRequirePlugin() {}

DynamicRequirePlugin.prototype.apply = function(compiler) {
  compiler.plugin("emit", function(compilation, callback) {
    var source = '\n\nwindow.webpackModuleMap = {\n';
    var basePath = compilation.options.context;
    compilation.modules.forEach(function(m) {
      var filename = m.resource || m.userRequest;
      if (filename) {
        filename = path.relative(basePath, filename);

        filename = filename.replace('node_modules/lavaca', 'lavaca')
                           .replace('node_modules/mout/src', 'mout')
                           .replace('src/www/js/', '')
                           .replace('.js', '')
                           .replace('.html', '');

        if (filename.indexOf('node_modules/jquery/') === 0) {
          filename = '$';
        }

        if (filename.indexOf('.less') === -1 && 
            filename.indexOf('node_modules/babel') === -1 && 
            filename.indexOf('node_modules/webpack') === -1) {
          source += '  "' + filename + '": ' + m.id + ',\n';
        }
      }
    });
    source += '};\n';

    var outputFile = compilation.options.output.filename;
    compilation.assets[outputFile] = new ConcatSource(compilation.assets[outputFile], source);

    callback();
  });
};

module.exports = DynamicRequirePlugin;
