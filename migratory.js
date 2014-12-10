#!/usr/bin/env node

var cliArgs = require('./cliArgs.js');

cliArgs.handle(function()
	{
		
var files = process.argv.slice(2);
var currentFile = 0;

var configFile = 'migratory.json';

var fs = require('fs');
var path = require('path');

var prompt = require('prompt');
var errorHandler = require('./errorHandler.js');
var dbHandler = require('./dbHandler.js');
var inquirer = require('inquirer');
var currPath = process.cwd();

/*
	Grab potential config files and start builing prompt
 */

settingsPrompt = [];

if(!fs.existsSync(currPath+'/'+configFile))
{
	console.log(configFile+' file not found. Are you in the right directory?');
	process.exit(0);
}

configSettings = JSON.parse(fs.readFileSync(currPath+'/'+configFile).toString());

for(i in configSettings)
{
	settingsPrompt.push({name: i + ' (' + configSettings[i].host + ':' + configSettings[i].database + ')', value: configSettings[i]})
}

/*
	Ask user what config file they wish to use
 */
inquirer.prompt({type: 'list', 
				message: 'Choose Database to Migrate to',
				choices: settingsPrompt,
				name: 'db'
				}, function(settings)
	{

		// Before we start, make sure each of the files exist.
		for (var i in files)
		{
			if(!fs.existsSync(files[i]))
			{
				console.log('\nImport File: '.magenta + files[i].yellow + ' does not exist. Please check path.'.magenta + '\n');
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

		console.log('\nHost:\t'.green + settings.db.host, '\nDb:\t'.green+ settings.db.database + '\nSchema:\t'.green + settings.db.schema + '\n');

		prompt.start();

		prompt.message = "";
		prompt.delimiter = "";

		prompt.get(promptSchema, function(err, result)
			{
				if(err) {return errorHandler.onErr(err);}
				credentials = {username: result.username,
								password: result.password,
								host: settings.db.host,
								database: settings.db.database,
								schema: settings.db.schema}

				dbHandler.beginMigration(credentials, files);
			});
	});
	});



