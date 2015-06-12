# Manages the manifest
# Currently only json file.

fs = require 'fs'
settings = require './settings'

module.exports =
   exists: (checksum) ->
      if typeof @manifest is 'undefined'
         settingsFile = settings.get()
         @manifest = @get()

      for file in @manifest
         return true if file.checksum = checksum

      false

   get: ->
      JSON.parse(fs.readFileSync("#{process.cwd()}/#{settings.get().migrationManifest}").toString())

   getManifestLabel: (dbCreds) ->
      label = "#{dbCreds.type}:#{dbCreds.database}@#{dbCreds.host}"
      if dbCreds.schema
         label += ":#{dbCreds.schema}"
      label

   process: (addThis, dbCreds, successful) ->
      @manifest = @get()
      @archiveLabel = if successful then 'successful' else 'failed'
      @manifestLabel = @getManifestLabel dbCreds
      @date = new Date

      if not @manifest.hasOwnProperty @manifestLabel
         @manifest[@manifestLabel] = {
            successful: [],
            failure: []
         }

      if addThis.constructor == Array
         for file in addThis
            @upsert file
      else
         @upsert file

      @save()

   upsert: (file) ->
      exists = @exists file
      if exists
         @update file, exists
      else
         @add file

   add: (file) ->
      file.dates = [@date]
      file.names = [file.name]
      delete file.name
      @manifest[@manifestLabel][@archiveLabel].push file

   update: (file, ref) ->
      nameExists = false
      for name in ref.names
            if name is file.name
               nameExists = true
               `break`

      if not nameExists
         ref.names.push file.name

      dateExists = false
      for date in ref.dates
            if date is @date
               dateExists = true
               `break`

      if not dateExists
         ref.dates.push @date

   exists: (file) ->
      for entry in @manifest[@manifestLabel][@archiveLabel]
         return entry if entry.checksum is file.checksum
      false

   save: ->
      try
         fs.writeFileSync settings.get().migrationManifest, JSON.stringify(@manifest, null, 3)
      catch e
         console.log 'Migration file Failed'.red
         console.log e
         console.log
         console.log 'If your migration was successful, you can manually add the following to your migration file:'
         console.log file
         process.exit 1
###
         {
         "[type:database@host:schema]":
            {
               "successful":
               [
                  {
                     "filename": "fileName",
                     "checksum": "checksum",
                     "dates":
                     [
                        "date"
                     ]
                  }
               ],
               "failed":
               [{}]
            }
###
