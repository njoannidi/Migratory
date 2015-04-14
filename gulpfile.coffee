gulp = require 'gulp'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
watch = require 'gulp-watch'
jshint = require 'gulp-jshint'
runSequence = require 'run-sequence'

path = require 'path'
fs = require 'fs'

handleError = (err) ->
    gutil.log "\n\n#{err.stack}\n\n"
    this.emit 'end'

gulp.task 'coffeeBang', ->
   runSequence 'coffee', 'shebang'

gulp.task 'coffee', ->
    gulp.src 'src/coffee/**/*.coffee'
    .pipe coffee bare: true
    .on 'error', handleError
    .pipe gulp.dest './src/bin'
    .on 'error', handleError

gulp.task 'shebang', ->
   entryPoint = './src/bin/migratory.js'

   data = fs.readFileSync entryPoint
   fd = fs.openSync entryPoint, 'w+'
   buffer = new Buffer '#!/usr/bin/env node\n\n'
   fs.writeSync fd, buffer, 0, buffer.length
   fs.writeSync fd, data, 0, data.length
   fs.close fd

gulp.task 'lint', ->
  gulp.src 'src/bin/**/*.js'
  .pipe jshint()
  .pipe jshint.reporter 'jshint-stylish'
  .on 'error', handleError

gulp.task 'watch', ->
    gulp.watch 'src/coffee/**/*.coffee', ['coffeeBang']
