mysql = require 'mysql'
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

mysqlDatabaseHandler =
      connect: (credentials, cb) ->
         connection = mysql.createConnection host: credentials.host,
            user: credentials.username,
            password: credentials.password,
            database: credentials.database,
            multipleStatements:true

         connection.connect (err) ->
            throw err if err
            process.stdout.write 'Successful'.green+'\n'
            cb connection if cb

      setSchema: (client, schema, cb) ->
         # No schemas in MySQL.
         console.log '\nSchemas are not supported in MySQL... Moving on. (Schema for this connection set to: '.green + credentials.schema + ')'.green
         cb client if cb
     
      beginTransaction: (client, cb) ->
         client.query 'START TRANSACTION', 
         (err, results) ->
            throw err if err
            cb client if cb
         
      rollback: (client, success, failure) ->
         client.query 'ROLLBACK', 
            (err, results) ->
            failure client if err and failure
            success client if success
         
      commit: (client, cb) ->
         client.query 'COMMIT', 
         (err,result) ->
            throw err if err 
            cb client if cb
         
      processFile: (client, sqlFile, cb) ->
         client.query sqlFile, 
            (err, result) ->
               throw err if err
               process.stdout.write ' Successful'.green
            cb client if cb
         
      handleError: (err, client) ->
         errorHandler.handleDbError err, client, this
      
module.exports = mysqlDatabaseHandler;