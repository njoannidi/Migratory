fs = require 'fs'
errorHandler = require './errorHandler.js'

dbHandler = 
   beginMigration: (credentials, filesToProcess) ->

      if !fs.existsSync __dirname+'/../orms/'+credentials.type+'.js'
         process.stdout.write '\nDatabase Type: '.red + credentials.type + ' not supported.\n Supported types: mysql, pgsql\n'
         process.exit 1
      
      @currentFile = 0
      @files = filesToProcess
      @database = require __dirname+'/orms/'+credentials.type+'.js'

      process.stdout.write '\nConnecting as '.green + credentials.username + ' ... '    

      @database.connect credentials, 
         (dbClient) ->
            # Success
            if credentials.schema
                  @database.setSchema dbClient, credentials.schema, 
                     (client) ->   
                        @database.beginTransaction client
                        @processFiles client
            else
               database.beginTransaction client
               @processFiles dbClient
         , (err) ->
            # Failure
            errorHandler.handleDbError err
      
   processFiles: (dbClient) ->
      currFile = @files[currentFile]

      process.stdout.write '\nProcessing file: '.green + currFile.yellow+' ...'.green
      sqlFile = fs.readFileSync currFile .toString
      
      database.processFile dbClient, sqlFile, 
         (dbClient)->
            # Success
            ++@currentFile;
            if @files.length > @currentFile
               @processFiles dbClient
            else
               @migrationComplete dbClient
         , (err, client, dbInterface) ->
            # Failure
            errorHandler.handleDbError err, client, dbInterface, currFile
   
   migrationComplete:
      (dbClient) ->
         database.commit dbClient, 
            ->         
               # Success
               console.log '\nMigration Complete'.green
               process.exit 0
            , (err, client) ->
               # Failure
               errorHandler.handleDbError err, client
         
module.exports = dbHandler