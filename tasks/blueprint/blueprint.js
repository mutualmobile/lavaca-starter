
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
      options.templateFolder = options.viewTemplateFolder === '' ? '' : options.viewTemplateFolder + '/';
        grunt.verbose.writeln('Options:', options);

      //Get Template
      var templateFilePath = __dirname + '/templates/lavaca/' + type + typeOptions.filetype;
        grunt.verbose.writeln('templatePath:', templateFilePath);
      var templateFile = grunt.file.read(templateFilePath);

      //Process
      var mainFileContent = grunt.template.process(templateFile,{data:options});

      //Generate extras for certain types
      if (type === 'view') {
        options.jsViewFolder = typeOptions.location === '' ? '': typeOptions.location + '/';

        var templateFilePathHtml = __dirname + '/templates/lavaca/' + type + options.templateFileType;
          grunt.verbose.writeln('templatePathHtml:', templateFilePathHtml);
        var templateFileHtml = grunt.file.read(templateFilePathHtml);
        var htmlFileContent = grunt.template.process(templateFileHtml,{data:options});
        var htmlSubFolder = options.viewTemplateFolder === '' ? '' : options.viewTemplateFolder + '/';
        var destinationPathHtml = options.templateRoot + '/' + htmlSubFolder + className + typeOptions.postfix + options.templateFileType;
          grunt.verbose.writeln('destinationPathHtml:', destinationPathHtml);

        //Save
        grunt.file.write(destinationPathHtml, htmlFileContent);
        grunt.log.writeln('Generated:', destinationPathHtml);

        var templateFilePathCss = __dirname + '/templates/lavaca/' + type + options.cssFileType;
        grunt.verbose.writeln('templatePathHtml:', templateFilePathCss);
        var templateFileCss = grunt.file.read(templateFilePathCss);
        var cssFileContent = grunt.template.process(templateFileCss,{data:options});
        options.cssSubFolder = options.viewCssFolder === '' ? '' : options.viewCssFolder + '/';
        var destinationPathCss = options.cssRoot + '/' + options.cssSubFolder + className + typeOptions.postfix + options.cssFileType;
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


      if (type === 'view') {
        grunt.log.writeln('');
        grunt.log.writeln('----------------------'['yellow']);
        grunt.log.writeln('Awesome! To finish hooking up your View,\nhere are the references you need to add:'['yellow']);
        grunt.log.writeln('----------------------'['yellow']);
        
        //less
        var importCss = '@import \''+options.cssSubFolder+options.className+'View.less\';';
        grunt.log.writeln('Add an import to app.less:', importCss['cyan']);

        //require the view
        grunt.log.writeln('');
        grunt.log.writeln('Require the View where you intend to use it.');
        var tmpString = '';
        tmpString = 'import {'+options.className+'View} from \'app/'+options.jsViewFolder+options.className+'View\';';
        grunt.log.writeln(tmpString['cyan']);
        grunt.log.writeln('');
        
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
        grunt.log.writeln(controllerRefFileContent['cyan']);

        //map childview
        grunt.log.writeln('');
        grunt.log.writeln('You can also use the view as a subview by mapping it as a childview:');
        tmpString = 'this.mapChildView({';
        grunt.log.writeln(tmpString['cyan']);
        tmpString = '  \'.'+options.classNameLowerCase+'-view\': { TView: '+options.className+'View, model: {} }';
        grunt.log.writeln(tmpString['cyan']);
        tmpString = '});';
        grunt.log.writeln(tmpString['cyan']);
      }

  });

};
