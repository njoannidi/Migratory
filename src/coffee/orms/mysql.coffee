mysql = require 'mysql'
fs = require 'fs'

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

mysqlDatabaseHandler =
   connect: (credentials, success, failure) ->
      connection = mysql.createConnection
         host: credentials.host,
         user: credentials.username,
         password: credentials.password,
         database: credentials.database,
         multipleStatements:true

      connection.connect (err) ->
         return failure err, connection, mysqlDatabaseHandler if err and failure
         process.stdout.write 'Successful'.green+'\n'
         success connection if success

   setSchema: (client, schema, success, failure) ->
      # No schemas in MySQL.
      console.log '\nSchemas are not supported in MySQL... Moving on. (Schema for mysqlDatabaseHandler connection set to: '.green + credentials.schema + ')'.green
      success client

   beginTransaction: (client, success, failure) ->
      client.query 'START TRANSACTION',
      (err, results) ->
         return failure err, client, mysqlDatabaseHandler if err and failure
         success client if success

   rollback: (client, success, failure) ->
      client.query 'ROLLBACK',
         (err, results) ->
            return failure err, client, mysqlDatabaseHandler if err and failure
            success client if success

   commit: (client, success, failure) ->
      client.query 'COMMIT',
      (err,result) ->
         return failure err, client, mysqlDatabaseHandler if err and failure
         success client

   processFile: (client, sqlFile, success, failure) ->
      client.query sqlFile,
         (err, result) ->
            return failure err, client, mysqlDatabaseHandler if err and failure
            process.stdout.write ' Successful'.green
            success client

module.exports = mysqlDatabaseHandler;
