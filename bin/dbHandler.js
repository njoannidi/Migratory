var fs = require('fs');
var errorHandler = require('./errorHandler.js');
var client, files, currentFile, database;

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
				client = dbClient;
				if(credentials.schema)
				{
					database.setSchema(client, credentials.schema, processFiles());
				}
				else
				{
					processFiles();
				}
			});
	}
	catch(err)
	{
		errorHandler.handleDbError(err);
	}

};

var processFiles = function()
{
	var currFile = files[currentFile];

	process.stdout.write('\nProcessing file: '.green + currFile.yellow+' ...'.green);
	var sqlFile = fs.readFileSync(currFile).toString();

	try
	{
		database.processFile(client, sqlFile, function()
		{
			++currentFile;
			if(files.length > currentFile)
			{
				processFiles();
			}
			else
			{
				migrationComplete();
			}
		});
	}
	catch (err)
	{
		errorHandler.handleDbError(err, client, database, currFile);
	}

};

var migrationComplete = function()
{
	try
	{
		database.commit(client, function()
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