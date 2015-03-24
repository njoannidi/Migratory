var errorHandler, fs, mysql, mysqlDatabaseHandler;

mysql = require('mysql');

fs = require('fs');

errorHandler = require('../bin/errorHandler.js');


/*

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
 */

mysqlDatabaseHandler = {
  connect: function(credentials, success, failure) {
    var connection;
    connection = mysql.createConnection({
      host: credentials.host
    }, {
      user: credentials.username,
      password: credentials.password,
      database: credentials.database,
      multipleStatements: true
    });
    return connection.connect(function(err) {
      if (err && failure) {
        return failure(err, connection, this);
      }
      process.stdout.write('Successful'.green + '\n');
      if (success) {
        return success(connection);
      }
    });
  },
  setSchema: function(client, schema, success, failure) {
    console.log('\nSchemas are not supported in MySQL... Moving on. (Schema for this connection set to: '.green + credentials.schema + ')'.green);
    return success(client);
  },
  beginTransaction: function(client, success, failure) {
    return client.query('START TRANSACTION', function(err, results) {
      if (err && failure) {
        return failure(err, client, this);
      }
      if (success) {
        return success(client);
      }
    });
  },
  rollback: function(client, success, failure) {
    return client.query('ROLLBACK', function(err, results) {
      if (err && failure) {
        return failure(err, client, this);
      }
      if (success) {
        return success(client);
      }
    });
  },
  commit: function(client, success, failure) {
    return client.query('COMMIT', function(err, result) {
      if (err && failure) {
        return failure(err, client, this);
      }
      return success(client);
    });
  },
  processFile: function(client, sqlFile, success, failure) {
    return client.query(sqlFile, function(err, result) {
      if (err && failure) {
        failure(err, client, this);
      }
      return process.stdout.write(' Successful'.green);
    }, success(client));
  }
};

module.exports = mysqlDatabaseHandler;
