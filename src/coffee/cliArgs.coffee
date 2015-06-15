###
   Each of the following will be checked with handle method.
   If Check evaluates to true, action will be run.
###

args =
   noFile:
      check: -> process.argv.length < 3
      action: ->
         process.stderr.write '\nNo File selected, Aborting. \nFor help please use -h\n'
         process.exit 1
   help:
      check: -> process.argv[2] is '-h' or process.argv[2] is 'help'
      action: ->
         console.log '''
         Migratory

         Reads SQL files and imports into specified DB within a transaction

         Usage:
         migratory [sqlFile1] [sqlFile2]

         Imports [sqlFile1] and [sqlFile2] sequentially within a transaction.
         There is no limit to the amount of files you can include here.
         If any errors are encountered, the changes will automatically be rolled back if possible.

         Settings File: migratory.json
         To generate a new settings file run:
         migratory init

         To upgrade your settings file run:
         migratory upgrade

         Login credentials will be asked upon migration.
         More info in README.md
         '''

         process.exit 0
   init:
      check: -> process.argv[2] is 'init'
      action: ->
         settings = require './settings.js'
         settings.create()

   checksum:
      check: -> process.argv[2] is 'checksum'
      action: ->
         return console.log 'Checksum requries a file from which a checksum will be generated.' if !process.argv[3]

         fs = require 'fs'

         return console.log "#{process.argv[3]}".yellow + " does not exist.".red if !fs.existsSync process.argv[3]

         fileString = fs.readFileSync(process.argv[3]).toString()

         checksum = require './checksum.js'

         console.log checksum.getFromString fileString

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
   for i of args
      return args[i].action() if args[i].check()
   cb()
