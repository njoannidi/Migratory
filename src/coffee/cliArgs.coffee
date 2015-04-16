###
   Each of the following will be checked with handle method.
   If Check evaluates to true, action will be run.
###

args =
   noFile:
      check: -> process.argv.length < 3
      action: ->
         process.stderr.write '\nNo File selected, Aborting. \nFor help please use -h'
         process.exit 1
   help:
      check: -> process.argv[2] is '-h' or process.argv[2] is 'help'
      action: ->
         console.log '''
         Migratoy

         Reads SQL files and imports into specified DB within a transaction

         Usage:
         migratory [sqlFile1] [sqlFile2]

         Imports [sqlFile1] and [sqlFile2] sequentially within a transaction.
         There is no limit to the amount of files you can include here.
         If any errors are encountered, the changes will automatically be rolled back if possible.\n
         Settings File: migratory.js
         To generate a new settings file, run:
         migratory init

         Login credentials will be asked upon migration.
         More info in README.md
         '''

         process.exit 0
   init:
      check: -> process.argv[2] is 'init'
      action: ->
         settings = require './settings.js'
         settings.create()

   upgrade:
      check: -> process.argv[2] is 'upgrade'
      action: ->
         fs = require 'fs'
         settings = require './settings.js'
         currentDirectory = process.cwd()
         settingsFile = JSON.parse(fs.readFileSync("#{currentDirectory}/migratory.json").toString())

         needsUpgrade = settings.needsUpgrade settingsFile

         if !needsUpgrade
            console.log 'Your settings file appears up to date!'.green
            process.exit 0

         settings.upgrade()


exports.handle = (cb) ->
   actionTriggered = false
   for i of args
      if args[i].check()
         actionTriggered = true
         args[i].action()
   # args[i].action() if args[i].check() for i of args
   cb() if not actionTriggered
