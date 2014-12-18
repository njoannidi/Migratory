var fs = require('fs');
var errorHandler = require('./errorHandler.js');
var files, currentFile, database;

module.exports.beginMigration = function (credentials, filesToProcess)
{
	if(!fs.existsSync(__dirname+'/../orms/'+credentials.type+'.js'))
	{	
		process.stdout.write('\nDatabase Type: '.red + credentials.type + ' not supported.\n Supported types: mysql, pgsql');
		process.exit(1);
	}

	database = require(__dirname+'/../orms/'+credentials.type+'.js');

	process.stdout.write('\nConnecting as '.green + credentials.username + ' ... ');

	currentFile = 0;
	files = filesToProcess;

	try
	{

		database.connect(credentials, function(dbClient)
			{
				if(credentials.schema)
				{
					database.setSchema(dbClient, credentials.schema, processFiles(dbClient));
				}
				else
				{
					processFiles(dbClient);
				}
			});
	}
	catch(err)
	{
		errorHandler.handleDbError(err);
	}

};

var processFiles = function(dbClient)
{
	var currFile = files[currentFile];

	process.stdout.write('\nProcessing file: '.green + currFile.yellow+' ...'.green);
	var sqlFile = fs.readFileSync(currFile).toString();

	try
	{
		database.processFile(dbClient, sqlFile, function(dbClient)
		{
			++currentFile;
			if(files.length > currentFile)
			{
				processFiles(dbClient);
			}
			else
			{
				migrationComplete(dbClient);
			}
		});
	}
	catch (err)
	{
		errorHandler.handleDbError(err, dbClient, database, currFile);
	}

};

var migrationComplete = function(dbClient)
{
	try
	{
		database.commit(dbClient, function()
			{
				console.log('\nMigration Complete'.green);		
				process.exit(0);
			});
	}
	catch(err)
	{
		errorHandler.handleDbError(err);
	}
};