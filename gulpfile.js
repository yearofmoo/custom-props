var gulp    = require('gulp');
var uglify  = require('gulp-uglify');
var shell   = require('gulp-shell');
var connect = require('gulp-connect');
var open    = require('gulp-open');
var rename  = require('gulp-rename');
var mocha   = require('gulp-mocha');
var karma   = require('karma').server;

var connect = require('gulp-connect');
gulp.task('example:server', function() {
  connect.server({
    root: './dist',
    port: 8866
  });
});

gulp.task('example:open', function(){
  gulp.src('./dist/example/index.html')
    .pipe(open('', {
      url: 'http://localhost:8866/example'
    }));
});

gulp.task('package:browser', function() {
  return gulp.src('lib/browser.js')
    .pipe(rename("custom-props.js"))
    .pipe(gulp.dest('dist'));
});

gulp.task('package:browser:compress', function() {
  return gulp.src('lib/browser.js')
    .pipe(uglify())
    .pipe(rename("custom-props.min.js"))
    .pipe(gulp.dest('dist'));
});

gulp.task('package:example', shell.task([
  'mkdir -p ./dist/example',
  'node ./scripts/build-example.js < ./example/styles.css > ./dist/example/styles.css',
  'cp ./example/index.html ./dist/example/index.html'
]));

gulp.task('package', [
  'package:browser',
  'package:browser:compress',
  'package:example'
]);

gulp.task('test:build', function () {
  return gulp.src('./test/build-tests/*.js', {read: false})
            .pipe(mocha());
});

gulp.task('test:karma', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
}); 

gulp.task('autotest:karma', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    watch: false
  }, done);
}); 

gulp.task('example', ['package', 'example:open', 'example:server']);
gulp.task('test', ['test:build', 'test:karma']);
gulp.task('watch', ['autotest:karma']);
gulp.task('default', ['package']);
