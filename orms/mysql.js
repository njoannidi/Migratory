var mysql = require('mysql');
var fs = require('fs');
var errorHandler = require('../bin/errorHandler.js');

var mysqlDatabaseHandler = 
	{
		connect: function(credentials, cb)
		{
			var connection = mysql.createConnection({host: credentials.host, user: credentials.username, password: credentials.password, database: credentials.database, multipleStatements:true});

			connection.connect(function(err)
			{
				if(err){ throw err; }

				process.stdout.write('Successful'.green+'\n');
				if(cb){ cb(connection); }
			});
		},

		setSchema: function(client, schema, cb)
		{
			// No schemas in MySQL.
			console.log('\nSchemas are not supported in MySQL... Moving on. (Schema for this connection set to: '.green + credentials.schema + ')'.green);
			if(cb) { cb(client);}
		},

		beginTransaction: function(client, cb)
		{
			client.query('START TRANSACTION', function(err, results)
			{
				if(err) {throw err;}
				if(cb) {return cb(client);}
			});
		},

		rollback: function(client, success, failure)
		{
			client.query('ROLLBACK', function(err, results)
			{
				if(err && failure) { failure(client); }
				else if(success) { success(client); }
			});
		},

		commit: function(client, cb)
		{
			client.query('COMMIT', function(err,result)
			{
				if(err) {throw err;}
				if(cb) { cb(client); }
			});
		},

		processFile: function(client, sqlFile, cb)
		{
			client.query(sqlFile, function(err, result)
			{
				if(err) { throw err; }
				process.stdout.write(' Successful'.green);
				if(cb) { cb(client); }
			});	
		},
		handleError: function(err, client)
		{
			errorHandler.handleDbError(err, client, this);
		}
	};

module.exports = mysqlDatabaseHandler;