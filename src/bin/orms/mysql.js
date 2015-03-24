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
      handleError

   The following methods are OPTIONAL:
      setSchema
 */

mysqlDatabaseHandler = {
  connect: function(credentials, cb) {
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
      if (err) {
        throw err;
      }
      process.stdout.write('Successful'.green + '\n');
      if (cb) {
        return cb(connection);
      }
    });
  },
  setSchema: function(client, schema, cb) {
    console.log('\nSchemas are not supported in MySQL... Moving on. (Schema for this connection set to: '.green + credentials.schema + ')'.green);
    if (cb) {
      return cb(client);
    }
  },
  beginTransaction: function(client, cb) {
    return client.query('START TRANSACTION', function(err, results) {
      if (err) {
        throw err;
      }
      if (cb) {
        return cb(client);
      }
    });
  },
  rollback: function(client, success, failure) {
    return client.query('ROLLBACK', function(err, results) {}, err && failure ? failure(client) : void 0, success ? success(client) : void 0);
  },
  commit: function(client, cb) {
    return client.query('COMMIT', function(err, result) {
      if (err) {
        throw err;
      }
      if (cb) {
        return cb(client);
      }
    });
  },
  processFile: function(client, sqlFile, cb) {
    return client.query(sqlFile, function(err, result) {
      if (err) {
        throw err;
      }
      return process.stdout.write(' Successful'.green);
    }, cb ? cb(client) : void 0);
  },
  handleError: function(err, client) {
    return errorHandler.handleDbError(err, client, this);
  }
};

module.exports = mysqlDatabaseHandler;
