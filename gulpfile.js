var gulp = require('gulp')
  , gutil = require('gulp-util')
  , browserify = require('gulp-browserify')
  , clean = require('gulp-clean')
  , concat = require('gulp-concat')
  , rename = require('gulp-rename')
  , minifycss = require('gulp-minify-css')
  , minifyhtml = require('gulp-minify-html')
  , processhtml = require('gulp-processhtml')
  , jshint = require('gulp-jshint')
  , uglify = require('gulp-uglify')
  , connect = require('gulp-connect')
  , zip = require('gulp-zip')
  , paths

paths = {
  assets: 'src/assets/**/*',
  css:    'src/css/*.css',
  libs:   [
    'src/bower_components/phaser-official/build/phaser.min.js'
  ],
  js:     ['src/js/**/*.js'],
  dist:   './dist/',
  finished: './dist/js/*.js'
}

gulp.task('clean', function () {
  return gulp.src(paths.dist, {read: false})
    .pipe(clean({force: true}))
    .on('error', gutil.log)
})

gulp.task('copy', ['clean'], function () {
  gulp.src(paths.assets)
    .pipe(gulp.dest(paths.dist + 'assets'))
    .on('error', gutil.log)
})

gulp.task('copy-libs', ['clean'], function () {
  gulp.src(paths.libs)
    .pipe(concat('lib.js'))
    .pipe(gulp.dest(paths.dist + 'js'))
    .on('error', gutil.log)
})

gulp.task('browserify', ['clean'], function() {
  return gulp.src('src/js/main.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production
    }))
    .pipe(gulp.dest(paths.dist + 'js'))
    .pipe(uglify({outSourceMaps: false}))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(paths.dist + 'js'))
});

gulp.task('minifycss', ['clean'], function () {
  gulp.src(paths.css)
    .pipe(minifycss({
      keepSpecialComments: false,
      removeEmpty: true
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.dist))
    .on('error', gutil.log)
})

gulp.task('processhtml', ['clean'], function() {
  gulp.src('src/index.html')
    .pipe(processhtml('index.html'))
    .pipe(gulp.dest(paths.dist))
    .on('error', gutil.log)
})

gulp.task('minifyhtml', ['clean'], function() {
  gulp.src('dist/index.html')
    .pipe(minifyhtml())
    .pipe(gulp.dest(paths.dist))
    .on('error', gutil.log)
})

gulp.task('lint', function() {
  gulp.src(paths.js)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .on('error', gutil.log)
})

gulp.task('html', ['build'], function(){
  gulp.src('dist/*.html')
    .pipe(connect.reload())
    .on('error', gutil.log)
})

gulp.task('connect', function () {
  connect.server({
    root: [__dirname + '/dist'],
    port: 8008,
    host: '0.0.0.0',
    livereload: true
  })
})

gulp.task('watch', function () {
  // gulp.watch(paths.js, ['lint'])
  gulp.watch(['./src/index.html', paths.css, paths.js], ['html'])
})

gulp.task('zip', function() {
  return gulp.src(['./dist/*/**', './dist/*'])
    .pipe(zip('Archive.zip'))
    .pipe(gulp.dest('./dist/'));
})

gulp.task('default', ['connect', 'watch'])
gulp.task('build', ['copy', 'copy-libs', 'browserify', 'minifycss', 'processhtml', 'minifyhtml'])

