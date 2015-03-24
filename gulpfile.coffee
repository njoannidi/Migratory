gulp = require 'gulp'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
watch = require 'gulp-watch'
jshint = require 'gulp-jshint'

path = require 'path'

handleError = (err) ->
    gutil.log "\n\n#{err.stack}\n\n"
    this.emit 'end'

gulp.task 'coffee', ->
    gulp.src 'src/coffee/**/*.coffee'
    .pipe coffee bare: true
    .on 'error', handleError
    .pipe gulp.dest './src/bin'
    .on 'error', handleError

gulp.task 'lint', ->
  gulp.src 'src/bin/**/*.js'
  .pipe jshint()
  .pipe jshint.reporter 'jshint-stylish'
  .on 'error', handleError

gulp.task 'watch', ->
    gulp.watch 'coffee/**/*.coffee', ['coffee']