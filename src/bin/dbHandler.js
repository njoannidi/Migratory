var dbHandler, errorHandler, fs;

fs = require('fs');

errorHandler = require('./errorHandler.js');

dbHandler = {
  beginMigration: function(credentials, filesToProcess) {
    var err;
    if (!fs.existsSync(__dirname + '/../orms/' + credentials.type + '.js')) {
      process.stdout.write('\nDatabase Type: '.red + credentials.type + ' not supported.\n Supported types: mysql, pgsql\n');
      process.exit(1);
    }
    this.currentFile = 0;
    this.files = filesToProcess;
    this.database = require(__dirname + '/orms/' + credentials.type + '.js');
    process.stdout.write('\nConnecting as '.green + credentials.username + ' ... ');
    try {
      return this.database.connect(credentials, function(dbClient) {
        if (credentials.schema) {
          return this.database.setSchema(dbClient, credentials.schema, function(client) {
            this.database.beginTransaction(client);
            return this.processFiles(client);
          });
        } else {
          database.beginTransaction(client);
          return this.processFiles(dbClient);
        }
      });
    } catch (_error) {
      err = _error;
      return errorHandler.handleDbError(err);
    }
  },
  processFiles: function(dbClient) {
    var currFile, err, sqlFile;
    currFile = this.files[currentFile];
    process.stdout.write('\nProcessing file: '.green + currFile.yellow + ' ...'.green);
    sqlFile = fs.readFileSync(currFile.toString);
    try {
      return database.processFile(dbClient, sqlFile, function(dbClient) {
        ++this.currentFile;
        if (this.files.length > this.currentFile) {
          return this.processFiles(dbClient);
        } else {
          return this.migrationComplete(dbClient);
        }
      });
    } catch (_error) {
      err = _error;
      return errorHandler.handleDbError(err, dbClient, database, currFile);
    }
  },
  migrationComplete: function(dbClient) {
    var err;
    try {
      return database.commit(dbClient, function() {
        console.log('\nMigration Complete'.green);
        return process.exit(0);
      });
    } catch (_error) {
      err = _error;
      return errorHandler.handleDbError(err);
    }
  }
};

module.exports = dbHandler;
