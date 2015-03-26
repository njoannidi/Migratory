errorHandler = 
   handleDbError: (err, client, database, file) ->
      console.log '\n\nError Encountered:\n'.red
      console.log err.toString().red
      if err.code and err.code.toString()
         console.log 'Error Code: '.red + err.code.toString().red
      console.log '\nAttempting to Roll Back.'.magenta

      database.rollback client, 
         ->
            # Success
            console.log 'Rollback Successful.'.yellow
            # console.log 'Error occurred in: '.magenta+file.yellow+' Please check this file and try again.\n'.magenta
            process.exit 1
         , ->
            # Failure
            console.log 'Rollback Unsuccessful. You may have to restore the database.\n'.red
            process.exit 2         

   onErr: (err, result) ->
      return if !err 
      console.log 'An Error as occurred:\n '.red
      console.log err
      process.exit 1
   
module.exports = errorHandler