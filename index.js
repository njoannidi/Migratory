#!/usr/bin/env node
if(process.argv.length < 3)
{
	console.log('No File selected, Aborting. \nFor help please use -h');
	return 1;
}

if(process.argv[2] === '-h')
{
	console.log('\nQuick and Not-So-Dirty DB Migration');

	console.log('Reads SQL files and imports into specified DB within a transaction');
	console.log('\nUsage:');
	console.log('./index.js [sqlFile1] [sqlFile2]');
	console.log('\n\nImports [sqlFile1] and [sqlFile2] sequentially within a transaction.');
	console.log('There is no limit to the amount of files you can include here.');
	console.log('If any errors are encountered, the changes will automatically be rolled back.\n');
	console.log('Db settings file: config/dbInfo.json');
	console.log('Login credentials will be asked upon migration.');
	console.log('More info in README.md\n');
	console.log('version 0.0.1a');

	process.exit(0);
}

var files = process.argv.slice(2);
var currentFile = 0;

var fs = require('fs');
var pg = require('pg');
var prompt = require('prompt');
var errorHandler = require('./errorHandler.js');

if(!fs.existsSync('config/dbInfo.json'))
{
	console.log('\nconfig/dbInfo.json'.yellow + ' does not exist. Please create one. (template: config/dbInfo.json.tmp)\n'.magenta);
	process.exit(1);
}

var settings = JSON.parse(fs.readFileSync('config/dbInfo.json').toString());

for (var i in files)
{
	if(!fs.existsSync(files[i]))
	{
		console.log('\nFile: '.magenta + files[i].yellow + ' does not exist. Please check path.'.magenta + '\n');
		process.exit(1);
	}
}

promptSchema = {
	properties: {
		username: 
		{
			description: 'Database Username: '.cyan,
			required: true
		},
		password: 
		{
			description: 'Database Password: '.cyan,
			hidden:true,
			required: true
		}
	}
}

console.log('\nHost:\t'.green + settings.host, '\nDb:\t'.green+ settings.database + '\nSchema:\t'.green + settings.database + '\n');

prompt.start();

prompt.message = "";
prompt.delimiter = "";

prompt.get(promptSchema, function(err, result)
	{
		if(err) {return errorHandler.onErr(err);}
		process.stdout.write('\nConnecting as '.green + result.username + ' ... ');

		pg.connect('postgres://'+result.username+':'+result.password+'@'+settings.host+'/'+settings.database, 
			function(err, client, done)
			{
				if(err){return errorHandler.onErr(err);}

				process.stdout.write('Successful'.green+'\n');

				if(settings.schema)
				{
					console.log('\nSetting Schema to: '.green + settings.schema);
					client.query('SET search_path TO "'+settings.schema+'"', 
						function(err, result)
						{
							if(err){errorHandler.onErr(err);}
							client.query('BEGIN;', function(err,result)
								{
									if(err) {return errorHandler.onErr(err);}
									processFiles(client);		
								});
							
						});
				} 
				else 
				{
					client.query('BEGIN;', function(err,result)
					{
						if(err) {return errorHandler.onErr(err);}
						processFiles(client);
					});

					
				}
			});
	});


function processFiles(client)
{
	var currFile = files[currentFile];
	
	process.stdout.write('\nProcessing file: '.green + currFile.yellow+' ...'.green);
	var sqlFile = fs.readFileSync(currFile).toString();

	client.query(sqlFile, function(err, result)
	{
		if(err) {return errorHandler.handleDbError(err, result, client, currFile);}

		process.stdout.write(' Successful'.green);
		handleCompletedMigration(client);
	});	
			
}

function handleCompletedMigration(client)
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

