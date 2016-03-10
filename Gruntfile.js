module.exports = function( grunt ) {

  'use strict';

  var timeStampVersionCode = String(Math.floor(new Date().getTime() / 1000));
  //Android limits the interger value
  var timeStampVersionCodeAndroid = timeStampVersionCode.substring(2);

  grunt.loadTasks('tasks/server');
  grunt.loadTasks('tasks/pkg');
  grunt.loadTasks('tasks/preprocess');
  grunt.loadTasks('tasks/blueprint');
  grunt.loadTasks('tasks/build');
  grunt.loadTasks('tasks/buildProject');
  grunt.loadTasks('tasks/initCordova');
  grunt.loadTasks('tasks/initPlatforms');
  grunt.loadTasks('tasks/cordovaBuild');
  grunt.loadTasks('tasks/cordovaInit');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-amd-dist');
  grunt.loadNpmTasks('grunt-amd-test');
  grunt.loadNpmTasks('grunt-amd-check');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-xmlstoke');
  grunt.loadNpmTasks('grunt-modernizr');
  grunt.loadNpmTasks('grunt-webpack');


  var ExtractTextPlugin = require('extract-text-webpack-plugin');
  var webpackConfig = require('./webpack.config.js'),
      webpack = require("webpack");

  var variablesObj = grunt.file.readJSON('./build-config.json');
  var variables = '';
  for (var key in variablesObj) {
    variables += key + '="' + variablesObj[key] + '"\n';
  }
  variables += 'timeStampVersionCode="' + timeStampVersionCode + '"\n';
  variables += 'timeStampVersionCodeAndroid="' + timeStampVersionCodeAndroid + '"\n';

  grunt.initConfig({
    timeStampVersionCode: timeStampVersionCode,
    timeStampVersionCodeAndroid: timeStampVersionCodeAndroid,
    buildConfigVariables: variablesObj,
    buildConfigVariablesFlat: variables,
    paths: {
      src: {
        root: 'src',
        www: '<%= paths.src.root %>/www',
        ios: '<%= paths.src.root %>/ios',
        android: '<%= paths.src.root %>/android'
      },
      lib: {
        atnotate: 'libs/atnotate'
      },
      tmp: {
        root: 'tmp',
        www: '<%= paths.tmp.root %>/www',
        ios: '<%= paths.tmp.root %>/ios',
        android: '<%= paths.tmp.root %>/android'
      },
      cordovaInit: {
        root: 'cordova',
        www: '<%= paths.cordovaInit.root %>/www'
      },
      build: {
        root: 'build',
        www: '<%= paths.build.root %>/www',
        cordova: '<%= paths.cordovaInit.root %>/www',
        android: '<%= paths.cordovaInit.root %>/platforms/android',
        androidLocalProperties: '<%= paths.build.android %>local.properties'
      },
      asset: {
        ios: '<%= paths.build.ios %>/www',
        android: '<%= paths.build.android %>/assets/www'
      },
      out: {
        index: 'index.html',
        css: 'css',
        js: 'js',
        cordova: 'cordova.js'
      },
      'package': {
        root: 'pkg',
        android: '<%= paths.package.root %>/<%= buildConfigVariables.appName %>.apk',
        ios: '<%= paths.package.root %>/<%= buildConfigVariables.appName %>.ipa'
      },
      doc: 'doc',
      copy: {
        www: [
          '<%= paths.out.index %>',
          'manifest.json',
          'favicon.ico',
          'browserconfig.xml',
          '<%= paths.out.css %>/<%= buildConfigVariables.appName %>.css ',
          '<%= paths.out.js %>/<%= buildConfigVariables.appName %>.min.js',
          '<%= paths.out.js %>/modernizr.js',
          'configs/**/*',
          'assets/**/*',
          'messages/**/*',
          'config.xml'
        ]
      }
    },

    'package': grunt.file.readJSON('package.json'),

    clean: {
      tmp: ['<%= paths.tmp.root %>'],
      iosGitIgnore: ['cordova/platforms/ios/.gitignore'],
      build: ['<%= paths.build.root %>'],
      'package': ['<%= paths.package.root %>'],
      cordova: ['<%= paths.cordovaInit.www %>'],
      init: ['<%= paths.cordovaInit.root %>']
    },

    xmlstoke: {
      updateVersion: {
        options: {
          actions: [
            { xpath: '/widget/@id', value: '<%= buildConfigVariables.bundleId %>' },
            { xpath: '/widget/@version', value: '<%= buildConfigVariables.version %>' },
            { type: 'I', xpath: '/widget', node: '@ios-CFBundleVersion', value: '<%= timeStampVersionCode %>'},
            { type: 'I', xpath: '/widget', node: '@android-versionCode', value: '<%= timeStampVersionCodeAndroid %>' }
          ]
        },
        files: {
          '<%= paths.cordovaInit.root %>/config.xml': '<%= paths.cordovaInit.root %>/config.xml'
        }
      }
    },

    preprocess: {
      www: {
        options: {
          locals: {
            version: "<script>window.appVersion = '<%= buildConfigVariables.version %>';",
            css: '<link rel="stylesheet" type="text/css" href="<%= paths.out.css %>/<%= buildConfigVariables.appName %>.css" />\n',
            js: '<script src="<%= paths.out.js %>/<%= buildConfigVariables.appName %>.min.js"></script>\n',
            ga_id: '<script>window.gaid = "<%= buildConfigVariables.gaWeb %>";</script>'
          }
        },
        files: [{
          src: '<%= paths.tmp.www %>/<%= paths.out.index %>',
          dest: '<%= paths.build.www %>/<%= paths.out.index %>'
        }]
      },
      ios: {
        options: {
          locals: {
            version: '<%= preprocess.wwww.options.locals.version %>',
            css: '<%= preprocess.www.options.locals.css %>',
            js: (function() {
              return [
                '<%= paths.out.cordova %>',
                '<%= paths.out.js %>/<%= buildConfigVariables.appName %>.min.js'
              ]
                .map(function(file) {
                  return '<script src="' + file + '"></script>';
                })
                .join('\n') + '\n';
            })(),
            ga_id: '<script>window.gaid = "<%= buildConfigVariables.gaIOS %>";</script>'
          }
        },
        files: [{
          src: '<%= paths.tmp.www %>/<%= paths.out.index %>',
          dest: '<%= paths.build.cordova %>/<%= paths.out.index %>'
        }]
      },
      android: {
        options: {
          locals: {
            version: '<%= preprocess.web.options.locals.version %>',
            css: '<%= preprocess.www.options.locals.css %>',
            js: '<%= preprocess.ios.options.locals.js %>',
            ga_id: '<script>window.gaid = "<%= buildConfigVariables.gaAndroid %>";</script>'
          }
        },
        files: [{
          src: '<%= paths.tmp.www %>/<%= paths.out.index %>',
          dest: '<%= paths.build.cordova %>/<%= paths.out.index %>'
        }]
      }
    },

    less: {
      build: {
        options: {
          compress: true
        },
        files: [
          {
            src: '<%= paths.tmp.www %>/css/app/app.less',
            dest: '<%= paths.tmp.www %>/<%= paths.out.css %>/<%= buildConfigVariables.appName %>.css'
          }
        ]
      },
      dev: {
        options: {
          compress: true
        },
        plugins: [
            new (require('less-plugin-autoprefix'))({browsers: ['last 2 versions']}),
            new (require('less-plugin-clean-css'))()
        ],
        files: [
          {
            src: '<%= paths.src.www %>/css/app/app.less',
            dest: '<%= paths.src.www %>/css/app/app.css'
          }
        ]
      }
    },

    jasmine: {
      all: ['test/runner.html'],
      options: {
        junit: {
          path: 'log/tests',
          consolidate: true
        }
      }
    },



    'amd-test': {
      mode: 'jasmine',
      files: 'test/unit/**/*.js'
    },

    server: {
      prod: {
        options: {
          port: process.env.PORT || 8080,
          hostname: '0.0.0.0',
          base: 'build/www',
          apiPrefix: '/api*',
          authUser: 'username',
          authPassword: 'password',
          proxyPort: '80',// change to 443 for https
          proxyProtocol: 'http'//change to https if ssl is required
        }
      },
      doc: {
        options: {
          port: 8080,
          vhost: 'localhost',
          base: 'doc'
        }
      }
    },

    copy: {
      cordovaConfig: {
        files: [
          {
            src: '<%= paths.cordovaInit.root %>/www/config.xml',
            dest: '<%= paths.src.www %>/config.xml'
          }
        ]
      },
      tmp: {
        files: [
          {
            expand: true,
            cwd: '<%= paths.src.root %>',
            src: '**/*',
            dest: '<%= paths.tmp.root %>/'
          },
          {
            expand: true,
            cwd: '<%= paths.src.root %>',
            src: '.cordova/**',
            dest: '<%= paths.tmp.root %>/'
          }
        ]
      },
      www: {
        files: [
          {
            expand: true,
            cwd: '<%= paths.tmp.www %>/',
            src: '<%= paths.copy.www %>',
            dest: '<%= paths.build.www %>/'
          }
        ]
      },
      cordova: {
        files: [
          {
            expand: true,
            cwd: '<%= paths.tmp.www %>/',
            src: '<%= paths.copy.www %>',
            dest: '<%= paths.cordovaInit.www %>/'
          }
        ]
      }
    },

    pkg: {
      ios: {
        options: {
          identity: 'iPhone Distribution: Mutual Mobile'
        },
        files: [
          {
            src: '<%= paths.build.ios %>',
            dest: '<%= paths.package.ios %>'
          }
        ]
      },
      android: {
        options: {
          targetSdk: undefined
        },
        files: [
          {
            src: '<%= paths.build.android %>',
            dest: '<%= paths.package.android %>'
          }
        ]
      }
    },

    'amd-check': {
      files: [
        '<%= paths.src.www %>/js/**/*.js',
        'test/unit/**/*.js'
      ]
    },

    'amd-dist': {
      all: {
        options: {
          standalone: true,
          exports: '<%= buildConfigVariables.appName %>'
        },
        files: [
          {
            src: [
              '<%= paths.tmp.www %>/js/libs/require.js',
              '<%= paths.tmp.www %>/js/app/boot.js',
              '<%= paths.tmp.www %>/js/templates.js'
            ],
            dest: '<%= paths.tmp.www %>/<%= paths.out.js %>/<%= buildConfigVariables.appName %>.min.js'
          }
        ]
      }
    },

    blueprint: {
      options: {
        appName: 'app',
        cssRoot: '<%= paths.src.www %>/css/<%= blueprint.options.appName %>',
        jsRoot: '<%= paths.src.www %>/js/<%= blueprint.options.appName %>',
        templateRoot: '<%= paths.src.www %>/js/templates',
        viewTemplateFolder: '',
        viewCssFolder: 'views',
        templateFileType: '.html',
        cssFileType: '.less',
        map:{
          view: {
            location: 'ui/views',
            postfix: 'View',
            filetype: '.js'
          },
          model: {
            location: 'models',
            postfix: 'Model',
            filetype: '.js'
          },
          collection: {
            location: 'collections',
            postfix: 'Collection',
            filetype: '.js'
          },
          controller: {
            location: 'net',
            postfix: 'Controller',
            filetype: '.js'
          },
          widget: {
            location: 'ui/widgets',
            postfix: 'Widget',
            filetype: '.js'
          }
        }
      }
    },

    requirejs: {
      baseUrl: '<%= paths.src.www %>/js',
      mainConfigFile: '<%= paths.src.www %>/js/app/boot.js',
      optimize: 'none',
      keepBuildDir: true,
      locale: "en-us",
      useStrict: false,
      skipModuleInsertion: false,
      findNestedDependencies: false,
      removeCombined: false,
      preserveLicenseComments: false,
      logLevel: 0
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: '<%= paths.src.www %>/js',
          outdir: '<%= paths.doc %>',
          exclude: '<%= paths.src.www %>/js/libs',
          linkNatives: true,
          themedir: 'libs/yuidoc/themes/default'
        }
      }
    },

    watch: {
      less: {
        files: ['src/www/css/**/*.less'],
        tasks: ['less:dev'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },

    buildProject: {
      local: {
        options: {
          tasks: ['shell:setShellVariables', 'webpack', 'preprocess']
        }
      },
      staging: {
        options: {
          tasks: ['shell:setShellVariables', 'less:build', 'amd-dist:all', 'uglify:all', 'preprocess']
        }
      },
      production: {
        options: {
          tasks: ['shell:setShellVariables', 'yuidoc:compile', 'less:build', 'amd-dist:all', 'uglify:all', 'preprocess']
        }
      }
    },

    initCordova: {
      init: {
        options: {
          appName: '<%= buildConfigVariables.appName %>',
          id: '<%= buildConfigVariables.bundleId %>'
        }
      }
    },

    initPlatforms: {
      init: {
        options: {
          platforms: ['ios', 'android']
        }
      }
    },

    shell: {
      mkCordovaDir: {
        command: 'mkdir <%= paths.cordovaInit.cordovaRoot %>',
        options: {
          stdout: true
        }
      },
      setShellVariables: {
        command: 'echo "<%= buildConfigVariablesFlat %>" > .build-config'
      }
    },


    modernizr: {
      devFile: 'src/www/js/modernizr.js',
      outputFile: '<%= paths.tmp.www %>/<%= paths.out.js %>/modernizr.js',
      files: [
        'src/www/css/**/*.less',
        'src/www/js/**/*.js',
        'src/www/js/templates/**/*.html'
      ],
      extra: {
        "shiv" : true,
        "printshiv" : false,
        "load" : true,
        "mq" : false,
        "cssclasses" : true
      }
    },


    connect: {
      options: {
        base: 'src/www'
      },
      dev: {
        options: {
          port: 8080,
          open: false,
          base: 'src/www',
          middleware: function(connect, opts) {
            return [
              require('connect-livereload')(),
              connect.static(require('path').resolve(opts.base))
            ];
          }
        }
      }
    },

    webpack: {
      options: webpackConfig,
      build: {
        output: {
          path: './<%= paths.tmp.www %>/<%= paths.out.js %>',
          filename: '<%= buildConfigVariables.appName %>.min.js',
        },
        failOnError: true, 
        keepalive: false,
        plugins: [
          new webpack.optimize.UglifyJsPlugin(),
          new ExtractTextPlugin('../<%= paths.out.css %>/<%= buildConfigVariables.appName %>.css', {
            allChunks: true
          })
        ]
      }
    },

    'webpack-dev-server': {
      options: {
        webpack: webpackConfig,
        port: 8080
      },
      start: {
        contentBase: '<%= paths.src.www %>',
        webpack: {
          devtool: 'eval',
          debug: false
        },
        watch: true,
        keepalive: true,
        plugins: [
          new webpack.HotModuleReplacementPlugin()
        ]
      }
    },
  });

  grunt.registerTask('default', 'runs the tests and starts local server', [
    'webpack-dev-server'
  ]);

  grunt.registerTask('compile', 'runs the tests and starts local server', [
    'webpack'
  ]);

  grunt.registerTask('test', 'generates runner and runs the tests', [
    'amd-test',
    'jasmine'
  ]);

  grunt.registerTask('doc', 'compiles documentation and starts a server', [
    'yuidoc',
    'server:doc'
  ]);

};
