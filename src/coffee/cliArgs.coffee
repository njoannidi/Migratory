###
   Each of the following will be checked with handle method.
   If Check evaluates to true, action will be run.
###

args =
   noFile: 
      check: -> process.argv.length < 3
      action: ->
         console.log 'No File selected, Aborting. \nFor help please use -h'
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
         fs = require 'fs'
         currPath = process.cwd()

         if fs.existsSync currPath+'/'+'migratory.json'
            console.log '''Unable to create migratory.json
            Current directory already contains a file called migratory.json'''

            process.exit 1

         settingsBase = "Destination Label": 
                           "host" : "",
                           "database" : "",
                           "type" : "",
                           "schema": ""
                        
         console.log 'Writing migratory.json to: '+currPath+'/migratory.json'

         initOut = JSON.stringify settingsBase, null, 4

         try
            fs.writeFileSync 'migratory.json', JSON.stringify(settingsBase,null,4)
         
         catch e
            console.log e
            process.exit 1
         
         console.log 'Success!'
         process.exit 0
         

exports.handle = (cb) ->
   args[i].action() if args[i].check() for i of args
   cb
