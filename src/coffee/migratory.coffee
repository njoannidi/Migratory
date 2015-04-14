fs = require 'fs'
path = require 'path'
prompt = require 'prompt'
inquirer = require 'inquirer'

cliArgs = require './cliArgs.js'
errorHandler = require './errorHandler.js'
dbHandler = require './dbHandler.js'

cliArgs.handle ->
   files = process.argv.slice 2
   currentFile = 0
   configFile = 'migratory.json'
   currPath = process.cwd()

   settingsPrompt = []

   for file in files
      if not fs.existsSync file
         console.log '\nImport file '.magenta + file.yellow + ' does not exist. Please check path.'.magenta + '\n'
         process.exit 1

   if not fs.existsSync "#{currPath}/#{configFile}"
      console.log "#{configFile} file not found. Are you in the right directory?"
      process.exit 0

   configSettings = JSON.parse(fs.readFileSync("#{currPath}/#{configFile}").toString())

   for k, v of configSettings
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
