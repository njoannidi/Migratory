exports.handleDbError = function(err, result, client, file)
{

	console.log('\n\nError Encountered:\n'.red);
	console.log(err.toString().red);
	console.log('Error Code: '.red +err.code.red);
	console.log('\nAttempting to Roll Back.'.magenta);

	client.query('ROLLBACK;', function(err, result)
		{
			if(err)
			{
				console.log('Rollback Unsuccessful. You may have to restore the database.\n'.red);
				process.exit(2);
			} 
			else 
			{
				console.log('Rollback Successful.'.yellow);
				console.log('Error occurred in: '.magenta+file.yellow+' Please check this file and try again.\n'.magenta);
				process.exit(1);				
			}
		});
};

exports.onErr = function(err, result)
{
	if(!err) {return;} 
	console.log('An Error as occurred:\n '.red);
	console.log(err);
	process.exit(1);
};
