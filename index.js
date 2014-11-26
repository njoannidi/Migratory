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

var configDirectory = 'config/';

var fs = require('fs');
var path = require('path');

var prompt = require('prompt');
var errorHandler = require('./errorHandler.js');
var dbHandler = require('./dbHandler.js');
var inquirer = require('inquirer');


/*
	Grab potential config files and start builing prompt
 */
configFiles = fs.readdirSync(configDirectory);
settingsPrompt = [];

for(i in configFiles)
{
	if(path.extname(configDirectory+configFiles[i]) == '.json')
	{
		currentConfig = JSON.parse(fs.readFileSync(configDirectory+configFiles[i]).toString());
		settingsPrompt.push({name: currentConfig.name + ' ('+currentConfig.host+':'+currentConfig.database+')', value: configFiles[i]});
	}
}

/*
	Ask user what config file they wish to use
 */
inquirer.prompt({type: 'list', 
				message: 'Choose Database to Migrate to',
				choices: settingsPrompt,
				name: 'configFile'
				}, function(answers)
	{

		// Ensure config file still exists
		if(!fs.existsSync(configDirectory+answers.configFile))
		{
			console.log('\n'+configDirectory+answers.configFile.yellow + ' does not exist. Please create one. (template: config/dbInfo.json.tmp)\n'.magenta);
			process.exit(1);
		}

		// Before we start, make sure each of the files exist.
		for (var i in files)
		{
			if(!fs.existsSync(files[i]))
			{
				console.log('\nFile: '.magenta + files[i].yellow + ' does not exist. Please check path.'.magenta + '\n');
				process.exit(1);
			}
		}

		var settings = JSON.parse(fs.readFileSync(configDirectory+answers.configFile).toString());

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
				credentials = {username: result.username,
								password: result.password,
								host: settings.host,
								database: settings.database,
								schema: settings.schema}

				dbHandler.beginMigration(credentials, files);
			});
		//process.exit(0);
	});


