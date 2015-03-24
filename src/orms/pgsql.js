var pg = require('pg');
var fs = require('fs');
var errorHandler = require('../bin/errorHandler.js');

pgDatabaseHandler = 	{
		connect: function(credentials, cb)
		{
			pg.connect('postgres://'+credentials.username+':'+credentials.password+'@'+credentials.host+'/'+credentials.database, 
				function(err, newClient, done)
				{
		         if(err) {pgDatabaseHandler.handleError(err); return false;}
					//if(err){throw err;}
					
					process.stdout.write('Successful'.green+'\n');
					if(cb) { cb(newClient); }
					
				});
		},

		setSchema: function(client, schema, cb)
		{
			console.log('\nSetting Schema to: '.green + credentials.schema);
			client.query('SET search_path TO '+credentials.schema+';', 
				function(err, result)
				{
					if(err){pgDatabaseHandler.handleError(err, client); return false;}
					if(cb) { cb(client); }
				});
		},

		beginTransaction: function(client, cb)
		{
			client.query('BEGIN;', function(err,result)
				{
					if(err) {pgDatabaseHandler.handleError(err, client);return false;}
					if(cb) { cb(client); }
					
				});
		},

		rollback: function(client, success, failure)
		{
			client.query('ROLLBACK;', function(err, result)
				{
					if(err && failure)
					{
						failure(client);
					} 
				else if(success)
				{
						success(client);
				}
				});
		},

		commit: function(client, cb)
		{
			client.query('COMMIT;', function(err,result)
			{
				if(err) {pgDatabaseHandler.handleError(err, client);}
					if(cb) { cb(client); }
			});
		},

		processFile: function(client, sqlFile, cb)
		{
			client.query(sqlFile, function(err, result)
			{
				if(err) {pgDatabaseHandler.handleError(err, client); return false;}
				process.stdout.write(' Successful'.green);
				if(cb) { cb(client); }
			});	
		},

		handleError: function(err, client)
		{
			errorHandler.handleDbError(err, client, this);
		}
	};

module.exports = pgDatabaseHandler;