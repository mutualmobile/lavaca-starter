'use strict'; 
var path = require('path');
var webpack = require('webpack');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');

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
    modulesDirectories: ['src','components','node_modules'],
    alias: {
      lavaca: 'lavaca',
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
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'jquery': path.join(__dirname, 'jquery/jquery.min'),
      hammer: 'hammer',
      'Hammer': 'hammerjs/dist/jquery.hammer',
      dust: 'dustjs-linkedin',
    }),
    new ExtractTextPlugin('css/app/app.css', {
      allChunks: true,
    })
  ],
  module: {
    loaders: [
      { test: /\.(jpg|png|gif)$/, loader: 'url-loader?name=assets/img/[name]-[hash].[ext]' },
      { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?name=assets/fonts/[name].[ext]' },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader','css-loader!postcss-loader!less-loader',
        {
          publicPath: "/"
        })
      },
      { test: /\.html$/, loader: 'dust-loader-complete', exclude: /node_modules/, query: { verbose: true } },
      {
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'src/www/js'),
          path.resolve(__dirname, 'src/www/components/lavaca'),
        ],
        exclude: /(node_modules)/,
        test: /\.js?$/,
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015'],
        }
      }
    ]
  },
  postcss: function () {
      return [autoprefixer({ browsers: ['last 2 versions'] })];
  }
};