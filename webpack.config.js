'use strict'; 
var path = require('path');
var webpack = require('webpack');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
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
  keepalive: true,
  inline: true,
  resolve: {
    root: __dirname,
    extensions: ['', '.js','.html'],
    modulesDirectories: ['src','components','node_modules'],
    alias: {
      lavaca: 'lavaca/src',
      app: 'www/js/app',
      css: 'www/css',
      templates: 'www/js/templates',
      'jquery': 'jquery/jquery.min.js',
      'hammer': 'hammerjs/dist/jquery.hammer',
      'Hammer': 'hammerjs/dist/jquery.hammer',
      'mout': 'mout/src',
      dustjs: 'dustjs-linkedin',
      'dust.core': 'dustjs-linkedin',
      'i18n': 'i18n/i18n'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      Hammer: 'hammer',
      dust: 'dustjs-linkedin',
    })
  ],
  module: {
    loaders: [
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')},
          
      { test: /\.html$/, loader: 'dust-loader-complete', exclude: /node_modules/, query: { verbose: true } }
    ]
  }
};