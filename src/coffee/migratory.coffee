fs = require 'fs'
path = require 'path'
prompt = require 'prompt'
inquirer = require 'inquirer'

cliArgs = require './cliArgs.js'
errorHandler = require './errorHandler.js'
dbHandler = require './dbHandler.js'
fileParser = require './fileParser.js'
settings = require './settings'
manifest = require './manifest'


cliArgs.handle ->
   # Declarations
   requested = process.argv.slice 2

   settingsPrompt = []
   files = []

   configSettings = settings.get()

   # Files
   files = fileParser.parse requested, configSettings

   # Server choices
   for k, v of configSettings.environments
      settingsPrompt.push
         name: "#{k} (#{v.host}:#{v.database} - #{v.type})"
         value: v

   inquirer.prompt
      type: 'list'
      message: 'To which database do you wish to migrate?'
      choices: settingsPrompt
      name: 'db'
      , (settings) ->

         console.log '\nHost:\t'.green + settings.db.host,
                     '\nDb:\t'.green + settings.db.database,
                     '\nSchema:\t'.green + settings.db.schema + '\n'

         existing = manifest.whichExist files, settings.db

         if existing.length is 0
            passwordPrompt settings
         else
            console.log 'You have already migrated the following files to this database.'.yellow
            console.log 'By default, these files will be skipped.\n'.yellow
            migrateAnywayPrompt existing, settings

   migrateAnywayPrompt = (existing, settings) ->
      for file in existing
         file.checked = true

      inquirer.prompt
         type: 'checkbox'
         message: 'Please unselect any files you wish to migrate anyway'.magenta
         choices: existing
         name: 'skip'
         , (filesTo) ->

            newFiles = []

            for file in files
               doSkip = false
               for skipFile in filesTo.skip
                  if skipFile is file.name
                     doSkip = true

               if not doSkip
                  delete file.checked
                  newFiles.push file

            if newFiles.length < 1
               console.log '\nNo files left to migrate. Aborting.\n'.yellow
               process.exit 1

            files = newFiles

            passwordPrompt settings


   passwordPrompt = (settings) ->
      promptSchema =
         properties:
            username:
               description: 'Database Username: '.cyan
               required: true
            password:
               description: 'Datatabase Password: '.cyan
               hidden: true
               required: true

      prompt.start()
      prompt.message = ''
      prompt.delimiter = ''

      prompt.get promptSchema, (err, res) ->
         return console.log err if err

         credentials =
            username: res.username
            password: res.password
            host: settings.db.host
            type: settings.db.type
            database: settings.db.database
            schema: settings.db.schema

         dbHandler.beginMigration credentials, files
