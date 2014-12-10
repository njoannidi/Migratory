/*
	Each of the following will be checked with handle method.
	If Check evaluates to true, action will be run.
 */

var args = {
	noFile : 
	{
		check : function()
		{
			return process.argv.length < 3;
		},
		action: function()
		{
			console.log('No File selected, Aborting. \nFor help please use -h');
			process.exit(1);
		}
	},
	help : 
	{
		check : function ()
		{
			return process.argv[2] === '-h' || process.argv[2] === 'help';
		},
		action: function()
		{
			console.log('\nMigratoy');

			console.log('Reads SQL files and imports into specified DB within a transaction');
			console.log('\nUsage:');
			console.log('migratory [sqlFile1] [sqlFile2]');
			console.log('\n\nImports [sqlFile1] and [sqlFile2] sequentially within a transaction.');
			console.log('There is no limit to the amount of files you can include here.');
			console.log('If any errors are encountered, the changes will automatically be rolled back if possible.\n');
			console.log('Settings File: migratory.js');
			console.log('To generate a new settings file, run:');
			console.log('migratory init\n');
			console.log('Login credentials will be asked upon migration.');
			console.log('More info in README.md\n');
			console.log('version 0.0.1a');

			process.exit(0);
		}
	},
	init : 
	{
		check : function () 
		{
			return process.argv[2] === 'init';
		},
		action : function()
		{
			fs = require('fs');
			currPath = process.cwd();

			if(fs.existsSync(currPath+'/'+'migratory.json'))
			{
				console.log('Unable to create migratory.json');
				console.log('Current directory already contains a file called migratory.json');

				process.exit(1);
			}

			settingsBase = {
								"Destination Label": 
								{
									"host" : "",
									"database" : "",
									"schema": ""
								}
							};


			console.log('Writing migratory.json to: '+currPath+'/migratory.json');

			initOut = JSON.stringify(settingsBase,null,4);

 			try
 			{
 				fs.writeFileSync('migratory.json', JSON.stringify(settingsBase,null,4));	
 			}
 			catch(e)
 			{
 				console.log(e);
 				process.exit(1)
 			}
 			console.log('Success!');
 			process.exit(0);
			
		}
	}
};


exports.handle = function(cb)
{
	for(i in args)
	{
		if(args[i].check())
		{
			args[i].action();
		}
	}	

	cb();
}

