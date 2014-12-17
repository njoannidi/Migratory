var fs = require('fs');

var client, files, currentFile, database;

module.exports.beginMigration = function (credentials, filesToProcess)
{

	if(!fs.existsSync('./orms/'+credentials.type+'.js'))
	{	
		process.stdout.write('\nDatabase Type: '.red + credentials.db.type + ' not supported.\n Supported types: mysql, pgsql');
		process.exit(1);
	}

	database = require('../orms/'+credentials.type+'.js');

	process.stdout.write('\nConnecting as '.green + credentials.username + ' ... ');

	currentFile = 0;
	files = filesToProcess;

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
};

var processFiles = function()
{
	var currFile = files[currentFile];

	process.stdout.write('\nProcessing file: '.green + currFile.yellow+' ...'.green);
	var sqlFile = fs.readFileSync(currFile).toString();

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

};

var migrationComplete = function()
{
	database.commit(client, function()
		{
			console.log('\nMigration Complete'.green);		
			process.exit(0);
		});
};