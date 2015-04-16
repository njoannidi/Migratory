fs = require 'fs'
path = require 'path'
prompt = require 'prompt'
inquirer = require 'inquirer'

cliArgs = require './cliArgs.js'
errorHandler = require './errorHandler.js'
dbHandler = require './dbHandler.js'
fileParser = require './fileParser.js'
settings = require './settings'

cliArgs.handle ->
   # Declarations
   requested = process.argv.slice 2
   currentFile = 0
   configFile = 'migratory.json'
   currPath = process.cwd()

   settingsPrompt = []
   files = []

   directoryNotification = false

   # Config Files
   if not fs.existsSync "#{currPath}/#{configFile}"
      console.log "#{configFile} file not found. Are you in the right directory?"
      process.exit 1

   configSettings = JSON.parse(fs.readFileSync("#{currPath}/#{configFile}").toString())

   if settings.needsUpgrade configSettings
      console.log '\nYour config file needs an upgrade.'.yellow
      console.log 'Please run: '.green + 'migratory upgrade\n'.white
      process.exit 1

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
            return errorHandler.onErr err if err

            credentials =
               username: res.username
               password: res.password
               host: settings.db.host
               type: settings.db.type
               database: settings.db.database
               schema: settings.db.schema

            dbHandler.beginMigration credentials, files
