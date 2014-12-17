exports.handleDbError = function(err, client, database, file)
{

	console.log('\n\nError Encountered:\n'.red);
	console.log(err.toString().red);
	console.log('Error Code: '.red +err.code.red);
	console.log('\nAttempting to Roll Back.'.magenta);

	database.rollback(client, 
		// Success
		function()
		{
			console.log('Rollback Successful.'.yellow);
			console.log('Error occurred in: '.magenta+file.yellow+' Please check this file and try again.\n'.magenta);
			process.exit(1);
		},
		// Failure
		function()
		{
			console.log('Rollback Unsuccessful. You may have to restore the database.\n'.red);
			process.exit(2);
		});
};

exports.onErr = function(err, result)
{
	if(!err) {return;} 
	console.log('An Error as occurred:\n '.red);
	console.log(err);
	process.exit(1);
};
