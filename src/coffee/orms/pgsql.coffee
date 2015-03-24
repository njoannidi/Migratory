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
      
   The following methods are OPTIONAL:
      setSchema

###

pgDatabaseHandler = 
   connect: (credentials, success, failure) ->
      pg.connect "postgres://#{credentials.username}:#{credentials.password}@#{credentials.host}/#{credentials.database}",
         (err, newClient, done) ->
            return failure err, newClient, this if err
            process.stdout.write 'Successful'.green + "\n"
            success newClient

      setSchema: (client, schema, success, failure) ->
         console.log '\nSetting Schema to: '.green + credentials.schema
         client.query 'SET search_path TO '+credentials.schema+';', 
            (err, result) ->
               return failure err, client, this if err
               success client  

      beginTransaction: (client, success, failure) ->
         client.query 'BEGIN;',
            (err,result) ->
               return failure err, client, this if err
               success client

      rollback: (client, success, failure) ->
         client.query 'ROLLBACK;',
            (err, result) ->
               return failure err, client, this if err
               success client if success

      commit: (client, success, failure) ->
         client.query 'COMMIT;',
            (err,result) ->
               return failure err, client, this if err
               success client

      processFile: (client, sqlFile, success, failure) ->
         client.query sqlFile,
            (err, result) ->
               return failure err, client, this if err
               process.stdout.write ' Successful'.green
               success client 

module.exports = pgDatabaseHandler;