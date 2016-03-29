module.exports = function(grunt) {
  'use strict';

  var preprocess = require('preprocess');

  grunt.registerMultiTask('preprocess', 'Preprocess HTML containing special comments', function(env) {
    var options = this.options();
    if (!env) {
      env = 'local';
    }
    options.locals.config = '<script>window.env = "'+env+'";</script>\n';
    this.files.forEach(function(f) {
      var contents = grunt.file.read(f.src[0]);
      var result = preprocess.preprocess(contents, options.locals);
      grunt.file.write(f.dest, result, 'utf-8');
    });
  });

};
