var gulp = require('gulp'),
    connect = require('gulp-connect'),
    open = require("gulp-open"),
    plugin = require('gulp-load-plugins')(),
    port = process.env.port || 1337;
var argv = require('minimist')(process.argv.slice(2));
var AUTOPREFIXER_BROWSERS = [                 // https://github.com/ai/autoprefixer
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];
var src = {
  styles:'src/css/**/*.{css,less}'
};

var RELEASE = !!argv.production;   //Should it minimize for build?

// launch browser in a port
gulp.task('open', function(){
  var options = {
    url: 'http://localhost:' + port,
  };
  gulp.src('./index.html')
  .pipe(open('', options));
});

// live reload server
gulp.task('connect', function() {
  connect.server({
    root: 'src',
    port: port,
    livereload: true
  });
});


// Generate CSS
gulp.task('less', function() {
  return gulp.src('src/css/app/app.less')
    .pipe(plugin.plumber())
    .pipe(plugin.less({
      sourceMap: !RELEASE,
      sourceMapBasepath: __dirname
    }))
    .on('error', console.error.bind(console))
    .pipe(plugin.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(plugin.csscomb())
    .pipe(plugin.if(RELEASE, plugin.minifyCss()))
    .pipe(gulp.dest('src/css'))
    .pipe(plugin.size({title: 'styles'}));
});

// live reload js
gulp.task('js', function () {
  gulp.src('./src/**/*.js')
    .pipe(connect.reload());
});

// live reload html
gulp.task('html', function () {
  gulp.src('./*.html')
    .pipe(connect.reload());
});

// watch files for live reload
gulp.task('watch', function() {
    console.log(src.styles);
    gulp.watch(src.styles,['less']);
    gulp.watch('src/js/*.js', ['js']);
    gulp.watch('src/index.html', ['html']);
});

gulp.task('default', ['connect', 'open', 'watch','less']);