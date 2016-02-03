var path = require("path");
var webpack = require("webpack");
var resolver = {
    root: __dirname,
    extensions: ['', '.js','.html','.dust'],
    modulesDirectories: ['src','components','node_modules'],
    alias: {
      lavaca: 'lavaca/src',
      app: 'www/js/app',
      templates: 'www/js/templates',
      'jquery': 'jquery/jquery.min.js',
      'hammer': 'hammerjs/dist/jquery.hammer',
      'Hammer': 'hammerjs/dist/jquery.hammer',
      'mout': 'mout/src',
      dustjs: 'dustjs-linkedin',
      'dust.core': 'dustjs-linkedin',
      'dust-helpers': 'dustjs-linkedin-helpers/dist/dust-helpers-1.1.1',
      'lavaca-dust-helpers': 'lavaca-dust-helpers/src/lavaca-dust-helpers',
      'i18n': 'i18n/i18n'
    }
  };
module.exports = {
  prod:{
    entry: path.resolve(__dirname,'./<%= paths.src.www %>/js/app/app.js'),
    output: {
      path: "./<%= paths.tmp.www %>/<%= paths.out.js %>/<%= buildConfigVariables.appName %>",
      filename: "<%= buildConfigVariables.appName %>.min.js",
    },
    stats: {
      colors: true,
      modules: true,
      reasons: true
    },
    progress: true, 
    failOnError: true, 
    watch: false,
    keepalive: false,
    inline: true,
    resolve: resolver,
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      }), new webpack.optimize.UglifyJsPlugin({minimize: true})
    ],
    module: {
      loaders: [
      { test: /\.html$/, loader: 'dust-loader-complete', exclude: /node_modules/, query: { verbose: true } },
      ]
    }
  },
  dev:{
    entry: path.resolve(__dirname,'./<%= paths.src.www %>/js/app/app.js'),
    output: {
      path: "./<%= paths.src.www %>",
      filename: "bundle.js",
    },
    stats: {
      colors: true,
      modules: true,
      reasons: true
    },
    progress: true, 
    failOnError: false, 
    watch: true,
    keepalive: true,
    inline: true,
    resolve: resolver,
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        Hammer: "hammer",
      })
    ],
    module: {
      loaders: [
        { test: /\.dust$/, loader: 'dust-loader-complete', exclude: /node_modules/, query: { verbose: true } }
        // { test: /\.dust$/, loader: "dust-loader-complete" }
      ]
    }
  }
};