var pg = require('pg');
var fs = require('fs');
var errorHandler = require('./errorHandler.js');

var client, files, currentFile;


module.exports.beginMigration = function (credentials, filesToProcess)
{
	process.stdout.write('\nConnecting as '.green + credentials.username + ' ... ');

	currentFile = 0;
	files = filesToProcess;

	pg.connect('postgres://'+credentials.username+':'+credentials.password+'@'+credentials.host+'/'+credentials.database, 
		function(err, newClient, done)
		{
			if(err){return errorHandler.onErr(err);}

			client = newClient;
			
			process.stdout.write('Successful'.green+'\n');

			if(credentials.schema)
			{
				console.log('\nSetting Schema to: '.green + credentials.schema);
				client.query('SET search_path TO "'+credentials.schema+'"', 
					function(err, result)
					{
						if(err){errorHandler.onErr(err);}
						client.query('BEGIN;', function(err,result)
							{
								if(err) {return errorHandler.onErr(err);}
								processFiles();		
							});
						
					});
			} 
			else 
			{
				client.query('BEGIN;', function(err,result)
				{
					if(err) {return errorHandler.onErr(err);}
					processFiles();
				});

				
			}
		});
};

var processFiles = function()
{
	var currFile = files[currentFile];

	process.stdout.write('\nProcessing file: '.green + currFile.yellow+' ...'.green);
	var sqlFile = fs.readFileSync(currFile).toString();

	client.query(sqlFile, function(err, result)
	{
		if(err) {return errorHandler.handleDbError(err, result, client, currFile);}

		process.stdout.write(' Successful'.green);
		handleCompletedMigration();
	});	

}

var handleCompletedMigration = function ()
{
	++currentFile;

	if(files.length > currentFile)
	{
		processFiles(client);
	}
	else
	{
		client.query('COMMIT;', function(err,result)
		{
			if(err) {return errorHandler.handleDbError(err);}
				console.log('\nMigration Complete'.green);		
				process.exit(0);
		});
	}
}