var dbHandler, errorHandler, fs;

fs = require('fs');

errorHandler = require('./errorHandler.js');

dbHandler = {
  beginMigration: function(credentials, filesToProcess) {
    if (!fs.existsSync(__dirname + '/orms/' + credentials.type + '.js')) {
      process.stdout.write('\nDatabase Type: '.red + credentials.type + ' not supported.\n Supported types: mysql, pgsql\n');
      process.exit(1);
    }
    this.currentFile = 0;
    this.files = filesToProcess;
    this.database = require(__dirname + '/orms/' + credentials.type + '.js');
    process.stdout.write('\nConnecting as '.green + credentials.username + ' ... ');
    return this.database.connect(credentials, function(dbClient) {
      if (credentials.schema) {
        return dbHandler.database.setSchema(dbClient, credentials.schema, function(client) {
          return dbHandler.database.beginTransaction(client, function() {
            return dbHandler.processFiles(client);
          }, errorHandler.handleDbError);
        });
      } else {
        return dbHandler.database.beginTransaction(client, function() {
          return dbHandler.processFiles(dbClient);
        }, dbHandler.processFiles);
      }
    }, function(err) {
      return errorHandler.onErr(err);
    });
  },
  processFiles: function(dbClient) {
    var currFile, sqlFile;
    currFile = this.files[this.currentFile];
    process.stdout.write('\nProcessing file: '.green + currFile.yellow + ' ...'.green);
    sqlFile = fs.readFileSync(currFile).toString();
    return this.database.processFile(dbClient, sqlFile, function(dbClient) {
      ++dbHandler.currentFile;
      if (dbHandler.files.length > dbHandler.currentFile) {
        return dbHandler.processFiles(dbClient);
      } else {
        return dbHandler.migrationComplete(dbClient);
      }
    }, function(err, client, dbInterface) {
      return errorHandler.handleDbError(err, client, dbInterface, currFile);
    });
  },
  migrationComplete: function(dbClient) {
    return dbHandler.database.commit(dbClient, function() {
      console.log('\nMigration Complete'.green);
      return process.exit(0);
    }, function(err, client) {
      return errorHandler.handleDbError(err, client);
    });
  }
};

module.exports = dbHandler;
