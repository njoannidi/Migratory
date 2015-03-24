var errorHandler, fs, pg, pgDatabaseHandler;

pg = require('pg');

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

pgDatabaseHandler = {
  connect: function(credentials, cb) {
    pg.connect("postgres://" + credentials.username + ":" + credentials.password + "@" + credentials.host + "/" + credentials.database, function(err, newClient, done) {
      if (err) {
        return this.handleError(err);
      }
      process.stdout.write('Successful'.green + "\n");
      return cb(newClient);
    });
    return {
      setSchema: function(client, schema, cb) {
        console.log('\nSetting Schema to: '.green + credentials.schema);
        return client.query('SET search_path TO ' + credentials.schema + ';', function(err, result) {
          if (err) {
            return this.handleError(err, client);
          }
          return cb(client);
        });
      },
      beginTransaction: function(client, cb) {
        return client.query('BEGIN;', function(err, result) {
          if (err) {
            return this.handleError(err, client);
          }
          return cb(client);
        });
      },
      rollback: function(client, success, failure) {
        return client.query('ROLLBACK;', function(err, result) {
          if (err) {
            return failure(client);
          }
          if (success) {
            return success(client);
          }
        });
      },
      commit: function(client, cb) {
        return client.query('COMMIT;', function(err, result) {
          if (err) {
            return this.handleError(err, client);
          }
          return cb(client);
        });
      },
      processFile: function(client, sqlFile, cb) {
        return client.query(sqlFile, function(err, result) {
          if (err) {
            return this.handleError(err, client);
          }
          process.stdout.write(' Successful'.green);
          return cb(client);
        });
      },
      handleError: function(err, client) {
        return errorHandler.handleDbError(err, client, this);
      }
    };
  }
};

module.exports = pgDatabaseHandler;
