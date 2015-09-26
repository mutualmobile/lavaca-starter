
'use strict';

module.exports = function(grunt) {
  grunt.registerTask('blueprint', 'Generator for user-defined templates', function(type, className) {

      grunt.log.writeln('');
      grunt.log.writeln('-------Generating-------'['yellow']);

      //Get options
      var options = this.options({
          key:'value'
      });

      //Get destination path and options for type
      var typeOptions;
      if( options.map ){
          typeOptions = options.map[type];
      }
      
      //Create variables
      var locationDotNotation = typeOptions.location.replace('/','.');
      options.className = className;
      options.classDotNotation = options.appName + '.' + locationDotNotation + '.' + className + typeOptions.postfix;
      options.classNameLowerCase = className.toLowerCase();
      options.postfix = typeOptions.postfix;
      options.templateFolder = type === 'view' ? options.viewTemplateFolder + '/' : options.pageviewTemplateFolder + '/';
        grunt.verbose.writeln('Options:', options);

      //Get Template
      var templateFilePath = __dirname + '/templates/lavaca/' + type + typeOptions.filetype;
        grunt.verbose.writeln('templatePath:', templateFilePath);
      var templateFile = grunt.file.read(templateFilePath);

      //Process
      var mainFileContent = grunt.template.process(templateFile,{data:options});

      //Generate extras for certain types
      if (type === 'view' || type === 'pageview') {
        var templateFilePathHtml = __dirname + '/templates/lavaca/' + type + options.templateFileType;
          grunt.verbose.writeln('templatePathHtml:', templateFilePathHtml);
        var templateFileHtml = grunt.file.read(templateFilePathHtml);
        var htmlFileContent = grunt.template.process(templateFileHtml,{data:options});
        var htmlSubFolder = type === 'view' ? options.viewTemplateFolder : options.pageviewTemplateFolder;
        var destinationPathHtml = options.templateRoot + '/' + htmlSubFolder + '/' + className + typeOptions.postfix + options.templateFileType;
          grunt.verbose.writeln('destinationPathHtml:', destinationPathHtml);

        //Save
        grunt.file.write(destinationPathHtml, htmlFileContent);
        grunt.log.writeln('Generated:', destinationPathHtml);

        var templateFilePathCss = __dirname + '/templates/lavaca/' + type + options.cssFileType;
        grunt.verbose.writeln('templatePathHtml:', templateFilePathCss);
        var templateFileCss = grunt.file.read(templateFilePathCss);
        var cssFileContent = grunt.template.process(templateFileCss,{data:options});
        var cssSubFolder = type === 'view' ? options.viewCssFolder : options.pageviewCssFolder;
        var destinationPathCss = options.cssRoot + '/' + cssSubFolder +  '/' + className + typeOptions.postfix + options.cssFileType;
          grunt.verbose.writeln('destinationPathCss:', destinationPathCss);

        //Save
        grunt.file.write(destinationPathCss, cssFileContent);
        grunt.log.writeln('Generated:', destinationPathCss);
      }

      var destinationPath = options.jsRoot + '/' + typeOptions.location + '/' + className + typeOptions.postfix + typeOptions.filetype;
        grunt.verbose.writeln('destinationPath:', destinationPath);

      //Save
      grunt.file.write(destinationPath, mainFileContent);

      //Done
      grunt.log.writeln('Generated:', destinationPath);

      if (type === 'pageview') {
        grunt.log.writeln('');
        grunt.log.writeln('----------------------'['yellow']);
        grunt.log.writeln('Awesome! To finish hooking up your PageView,\nhere are the references you need to add:'['yellow']);
        grunt.log.writeln('----------------------'['yellow']);
        
        //less
        var importCss = '@import \'pageviews/'+options.className+'View.less\';';
        grunt.log.writeln('Add an import to app.less:', importCss['cyan']);
        
        //route
        var routeRef = '\'/'+options.classNameLowerCase+'\': [HomeController, \''+options.classNameLowerCase+'\']';
        grunt.log.writeln('Add a route to app.js:', routeRef['cyan']);

        //print controller reference
        var templateFilePathControllerRef = __dirname + '/templates/lavaca/ControllerReference.js';
        grunt.verbose.writeln('templatePathControllerRef:', templateFilePathControllerRef);
        var templateFileControllerRef = grunt.file.read(templateFilePathControllerRef);
        var controllerRefFileContent = grunt.template.process(templateFileControllerRef,{data:options});
        grunt.log.writeln('');
        grunt.log.writeln('Finally, add a reference in your controller:');
        grunt.log.writeln('');
        grunt.log.writeln(controllerRefFileContent['cyan']);
      }

      if (type === 'view') {
        grunt.log.writeln('');
        grunt.log.writeln('----------------------'['yellow']);
        grunt.log.writeln('Awesome! To finish hooking up your View,\nhere are the references you need to add:'['yellow']);
        grunt.log.writeln('----------------------'['yellow']);
        
        //less
        var importViewCss = '@import \'childviews/'+options.className+'View.less\';';
        grunt.log.writeln('Add an import to app.less:', importViewCss['cyan']);
        
        //map childview
        grunt.log.writeln('Map the childview:');
        var tmpString = '';
        grunt.log.writeln(tmpString);
        tmpString = 'var '+options.className+'View = require(\'app/ui/views/childviews/'+options.className+'View\')';
        grunt.log.writeln(tmpString['cyan']);
        grunt.log.writeln('');
        tmpString = 'this.mapChildView({';
        grunt.log.writeln(tmpString['cyan']);
        tmpString = '  \'.'+options.classNameLowerCase+'-view\': { TView: '+options.className+'View, model: {} }';
        grunt.log.writeln(tmpString['cyan']);
        tmpString = '});';
        grunt.log.writeln(tmpString['cyan']);
      }

  });

};
