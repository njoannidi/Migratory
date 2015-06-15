manifest = require './manifest.js'

errorHandler =
   handleDbError: (err, client, database, file, files, credentials) ->
      process.stderr.write '\n\nError Encountered:\n'.red
      process.stderr.write err.toString().red
      if err.code and err.code.toString()
         process.stderr.write 'Error Code: '.red + err.code.toString().red
      process.stderr.write '\nAttempting to Roll Back.'.magenta

      if files?
         manifest.process files, credentials, false

      database.rollback client,
         ->
            # Success
            process.stderr.write ' Rollback Successful.'.yellow
            if file
               process.stderr.write '\nError occurred in: '.magenta+file.name.yellow+' Please check this file and try again.\n'.magenta
            process.exit 1
         , ->
            # Failure
            process.stderr.write ' Rollback Unsuccessful. You may have to restore the database.\n'.red
            process.exit 2

   onErr: (err, result) ->
      return if !err
      process.stderr.write 'An Error as occurred:\n '.red
      process.stderr.write err
      process.exit 1

module.exports = errorHandler
