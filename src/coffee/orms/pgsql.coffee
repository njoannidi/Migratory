pg = require 'pg'
fs = require 'fs'
errorHandler = require '../bin/errorHandler.js'

###

   Database Adapter

   Since JS doesn't have interfaces, here's a spec:   

   The following methods are REQUIRED:
      connect
      beginTransaction
      rollback
      commit
      processFile
      handleError

   The following methods are OPTIONAL:
      setSchema

###

pgDatabaseHandler = 
   connect: (credentials, cb) ->
      pg.connect "postgres://#{credentials.username}:#{credentials.password}@#{credentials.host}/#{credentials.database}",
         (err, newClient, done) ->
            return @handleError err if err               
            process.stdout.write 'Successful'.green + "\n"
            cb newClient

      setSchema: (client, schema, cb) ->
         console.log '\nSetting Schema to: '.green + credentials.schema
         client.query 'SET search_path TO '+credentials.schema+';', 
            (err, result) ->
               return @handleError err, client if err
               cb client  

      beginTransaction: (client, cb) ->
         client.query 'BEGIN;',
            (err,result) ->
               return @handleError err, client if err               
               cb client

      rollback: (client, success, failure) ->
         client.query 'ROLLBACK;',
            (err, result) ->
               return failure client if err
               return success client if success

      commit: (client, cb) ->
         client.query 'COMMIT;',
            (err,result) ->
               return @handleError err, client if err
               cb client

      processFile: (client, sqlFile, cb) ->
         client.query sqlFile,
            (err, result) ->
               return @handleError err, client if err
               process.stdout.write ' Successful'.green
               cb client 

      handleError: (err, client) ->
         errorHandler.handleDbError err, client, this
      
module.exports = pgDatabaseHandler;