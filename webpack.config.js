'use strict';
var path = require('path');
var webpack = require('webpack');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var WebpackShellPlugin = require('webpack-shell-plugin');
var DynamicRequirePlugin = require('./DynamicRequirePlugin');

module.exports = {
  entry: path.resolve(__dirname,'./<%= paths.src.www %>/js/app/app.js'),
  output: {
    path: './<%= paths.src.www %>',
    filename: 'bundle.js',
  },
  stats: {
    colors: true,
    modules: true,
    reasons: true
  },
  progress: true,
  failOnError:false,
  watch: true,
  hot: false,
  keepalive: true,
  inline: true,
  resolve: {
    root: __dirname,
    extensions: ['', '.js','.html'],
    modulesDirectories: ['src','node_modules'],
    alias: {
      lavaca: 'node_modules/lavaca',
      app: 'www/js/app',
      css: 'www/css',
      templates: 'www/js/templates',
      'jquery-mobile': 'jquery-touch-events',
      'mout': 'mout/src',
      dustjs: 'dustjs-linkedin',
      'dust.core': 'dustjs-linkedin',
      'i18n': 'i18n/i18n'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'jquery': path.join(__dirname, 'node_modules/jquery'),
      dust: 'dustjs-linkedin',
    }),
    new ExtractTextPlugin('css/app/app.css', {
      allChunks: true,
    }),
    new DynamicRequirePlugin(),
    new WebpackShellPlugin({onBuildExit:['./node_modules/.bin/kss-node src/www/css/theme src/www/assets/styleguide --css ../../css/app/app.css --template src/www/assets/template/']})
  ],
  module: {
    loaders: [
      { test: /\.(jpg|png|gif|svg)$/, loader: 'url-loader' },
      { test: /\.(woff|woff2|eot|ttf)$/, loader: 'url-loader?limit=10000' },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader','css-loader!autoprefixer-loader?browsers=last 2 version!less-loader?relativeUrls=false')
      },
      { test: /\.html$/, loader: 'dust-loader-complete', exclude: /node_modules/, query: { verbose: true } },
      {
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'src/www/js'),
          path.resolve(__dirname, 'node_modules/lavaca'),
        ],
        test: /\.js?$/,
        query: {
          presets: ['es2015-webpack'],
          plugins: [
            'transform-runtime',
            ['transform-es2015-modules-commonjs-simple', { 'noMangle': true, 'addExports': true }]
          ]
        }
      }
    ]
  }
};
