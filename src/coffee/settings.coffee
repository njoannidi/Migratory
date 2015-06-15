fs = require 'fs'
inquirer = require 'inquirer'

settings =
   needsUpgrade: (settingsFile) ->
      # Make sure 'environments' is always first, as it will nest the current settings file
      # under environments, which if migrationDirectory or manifest is done first will.
      # break the settings file.

      checkKeys = ['environments', 'migrationDirectory', 'migrationManifest']
      @settingsFile = settingsFile
      @needKeys = []

      for checkKey in checkKeys
         keyExists = checkKey of @settingsFile
         if not keyExists
            @needKeys.push checkKey

      return @needKeys.length > 0

   upgrade: ->
      if typeof @initialMessage is 'undefined'
         console.log '\nIt looks like we need to upgrade your migratory.json file.'.yellow
         console.log 'For more information on the current format, please see the wiki:'.green
         console.log 'https://github.com/njoannidi/Migratory/wiki/migratory.json\n'.cyan
         @initialMessage = true

      if @needKeys.length > 0
         @["upgrade_#{@needKeys.shift()}"]()
      else
         @writeFile()

   upgrade_environments: ->
      that = this
      console.log '\nIt appears you may be specifying your environments in an old way.'.yellow
      console.log 'Going forward, environments should be specified under the key "environments"'.green
      console.log '\nAttempting to update your settings automatically.\n'.green

      newSettingsFile = environments: @settingsFile

      console.log newSettingsFile
      console.log ''

      inquirer.prompt
         type: 'confirm'
         message: 'Does this look correct?'
         name: 'correct'
         , (answer) ->
            if answer.correct
               that.settingsFile = newSettingsFile
               that.upgrade()
            else
               console.log '\n No changes made. \n Please upgrade your migratory.json manually.'.yellow
               process.exit 1

   upgrade_migrationDirectory: ->
      that = this
      console.log '\nPlease specify a migrations directory.'.yellow
      console.log 'This will come into play if the file specified is not found.'.green
      console.log 'Migratory will then look in the migrations directory.'.green
      console.log 'This directory should be relative to project root. No preceeding slash needed.\n'.green

      inquirer.prompt
         type: 'input'
         message: 'Migration Directory'
         name: 'migrationDirectory'
         default: 'migrations'
         , (answer) ->
            that.settingsFile.migrationDirectory = answer.migrationDirectory
            that.upgrade()

   upgrade_migrationManifest: ->
      that = this
      console.log '\nPlease specify a manifest file.'.yellow
      console.log 'This will store passed and failed migrations.'.green
      console.log 'You may want to add this to your gitignore.'.yellow
      console.log 'Please see the wiki for more information.\n'.cyan
      # console.log 'This simplifies migrations, as you can specify a directory and migratory will only'
      # console.log 'migrate the files which have not yet been migrated.'
      # console.log 'This will only come into play if a directory is specified. You can still'
      # console.log 'migrate a file by specifying it directoy, although a notification will appear.'

      inquirer.prompt
         type: 'input'
         message: 'Manifest File'
         name: 'migrationManifest'
         default: 'migratoryManifest.json'
         , (answer) ->
            that.settingsFile.migrationManifest = answer.migrationManifest
            manifestBase = fs.readFileSync("#{__dirname}/templates/migratoryManifest.json").toString()
            currPath = process.cwd()
            console.log "Writing manifest to: #{currPath}/#{answer.migrationManifest}".green

            try
               fs.writeFileSync answer.migrationManifest, '{}'
            catch e
               console.log 'Write Failed'.red
               console.log e
               process.exit 1
               
            that.upgrade()

   exists: (path, file) ->
      if fs.existsSync path+'/'+file
         process.stderr.write """\nUnable to create #{file}
         #{path} already contains #{file}\n\n"""

         return true
      false

   create: ->
      currPath = process.cwd()

      if @exists currPath, 'migratory.json'
         process.exit 1

      if @exists currPath, 'migratoryManifest.json'
         process.exit 1

      settingsBase = fs.readFileSync("#{__dirname}/templates/migratory.json").toString()
      console.log 'Writing migratory.json to: '+currPath+'/migratory.json'.green

      try
         fs.writeFileSync 'migratory.json', settingsBase
      catch e
         console.log 'Write Failed'.red
         console.log e
         process.exit 1

      console.log 'Success!'.green

      manifestBase = fs.readFileSync("#{__dirname}/templates/migratoryManifest.json").toString()
      console.log 'Writing migratoryManifest.json to: '+currPath+'/migratoryManifest.json'.green

      try
         fs.writeFileSync 'migratoryManifest.json', '{}'
      catch e
         console.log 'Write Failed'.red
         console.log e
         process.exit 1

      console.log 'Success!'.green

      process.exit 0

   writeFile: ->
      currPath = process.cwd()
      console.log 'Writing migratory.json to: '+currPath+'/migratory.json'

      out = JSON.stringify @settingsFile, null, 3

      try
         fs.writeFileSync 'migratory.json', out
      catch e
         console.log e
         process.exit 1

      console.log 'Success!'
      process.exit 0

   get: ->

      configFile = 'migratory.json'
      currPath = process.cwd()

      # Config Files
      if not fs.existsSync "#{currPath}/#{configFile}"
         console.log "#{configFile} file not found. Are you in the right directory?"
         process.exit 1

      configSettings = JSON.parse(fs.readFileSync("#{currPath}/#{configFile}").toString())

      if @needsUpgrade configSettings
         console.log '\nYour config file needs an upgrade.'.yellow
         console.log 'Please run: '.green + 'migratory upgrade\n'.white
         process.exit 1

      configSettings

module.exports = settings
