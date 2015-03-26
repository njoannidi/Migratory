var errorHandler;

errorHandler = {
  handleDbError: function(err, client, database, file) {
    console.log('\n\nError Encountered:\n'.red);
    console.log(err.toString().red);
    if (err.code && err.code.toString()) {
      console.log('Error Code: '.red + err.code.toString().red);
    }
    console.log('\nAttempting to Roll Back.'.magenta);
    return database.rollback(client, function() {
      console.log('Rollback Successful.'.yellow);
      if (file) {
        console.log('\nError occurred in: '.magenta + file.yellow + ' Please check this file and try again.\n'.magenta);
      }
      return process.exit(1);
    }, function() {
      console.log('Rollback Unsuccessful. You may have to restore the database.\n'.red);
      return process.exit(2);
    });
  },
  onErr: function(err, result) {
    if (!err) {
      return;
    }
    console.log('An Error as occurred:\n '.red);
    console.log(err);
    return process.exit(1);
  }
};

module.exports = errorHandler;
