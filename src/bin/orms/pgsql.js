var fs, pg, pgDatabaseHandler;

pg = require('pg');

fs = require('fs');


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

pgDatabaseHandler = {
  connect: function(credentials, success, failure) {
    return pg.connect("postgres://" + credentials.username + ":" + credentials.password + "@" + credentials.host + "/" + credentials.database, function(err, newClient, done) {
      if (err) {
        return failure(err, newClient, pgDatabaseHandler);
      }
      process.stdout.write('Successful'.green + "\n");
      return success(newClient);
    });
  },
  setSchema: function(client, schema, success, failure) {
    console.log('\nSetting Schema to: '.green + credentials.schema);
    return client.query('SET search_path TO ' + credentials.schema + ';', function(err, result) {
      if (err) {
        return failure(err, client, pgDatabaseHandler);
      }
      return success(client);
    });
  },
  beginTransaction: function(client, success, failure) {
    return client.query('BEGIN;', function(err, result) {
      if (err) {
        return failure(err, client, pgDatabaseHandler);
      }
      return success(client);
    });
  },
  rollback: function(client, success, failure) {
    return client.query('ROLLBACK;', function(err, result) {
      if (err) {
        return failure(err, client, pgDatabaseHandler);
      }
      if (success) {
        return success(client);
      }
    });
  },
  commit: function(client, success, failure) {
    return client.query('COMMIT;', function(err, result) {
      if (err) {
        return failure(err, client, pgDatabaseHandler);
      }
      return success(client);
    });
  },
  processFile: function(client, sqlFile, success, failure) {
    return client.query(sqlFile, function(err, result) {
      if (err) {
        return failure(err, client, pgDatabaseHandler);
      }
      process.stdout.write(' Successful'.green);
      return success(client);
    });
  }
};

module.exports = pgDatabaseHandler;
