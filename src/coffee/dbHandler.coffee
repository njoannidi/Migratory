fs = require 'fs'
errorHandler = require './errorHandler.js'

dbHandler = 
   beginMigration: (credentials, filesToProcess) ->

      if !fs.existsSync __dirname+'/../orms/'+credentials.type+'.js'
         process.stdout.write '\nDatabase Type: '.red + credentials.type + ' not supported.\n Supported types: mysql, pgsql\n'
         process.exit 1
      
      @currentFile = 0;
      @files = filesToProcess;
      @database = require __dirname+'/orms/'+credentials.type+'.js'

      process.stdout.write '\nConnecting as '.green + credentials.username + ' ... '    

      try
         @database.connect credentials, 
            (dbClient) ->
               if credentials.schema
                     @database.setSchema dbClient, credentials.schema, 
                        (client) ->   
                           @database.beginTransaction client
                           @processFiles client
               else
                  database.beginTransaction client
                  @processFiles dbClient
      catch err
         errorHandler.handleDbError err
      
   processFiles: (dbClient) ->
      currFile = @files[currentFile]

      process.stdout.write '\nProcessing file: '.green + currFile.yellow+' ...'.green
      sqlFile = fs.readFileSync currFile .toString

      try
         database.processFile dbClient, sqlFile, 
            (dbClient)->
               ++@currentFile;
               if @files.length > @currentFile
                  @processFiles dbClient
               else
                  @migrationComplete dbClient
      catch err
         errorHandler.handleDbError(err, dbClient, database, currFile);

   migrationComplete:
      (dbClient) ->
         try
            database.commit dbClient, 
               ->         
                  console.log '\nMigration Complete'.green
                  process.exit 0
         catch err
            errorHandler.handleDbError err
         
module.exports = dbHandler