var pg = require('pg');
var fs = require('fs');

module.exports.connect = function(credentials, cb)
{
	pg.connect('postgres://'+credentials.username+':'+credentials.password+'@'+credentials.host+'/'+credentials.database, 
		function(err, newClient, done)
		{
			if(err){throw err;}
			
			process.stdout.write('Successful'.green+'\n');
			if(cb) { cb(newClient); }
			
		});
};

module.exports.setSchema = function(client, schema, cb)
{
	console.log('\nSetting Schema to: '.green + credentials.schema);
	client.query('SET search_path TO "'+credentials.schema+';"', 
		function(err, result)
		{
			if(err){throw err;}
			if(cb) { cb(client); }
		});
};

module.exports.beginTransaction = function(client, cb)
{
	client.query('BEGIN;', function(err,result)
		{
			if(err) {throw err;}
			if(cb) { cb(client); }
			
		});
};

module.exports.rollback = function(client, success, failure)
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
};

module.exports.commit = function(client, cb)
{
	client.query('COMMIT;', function(err,result)
	{
		if(err) {throw err;}
			if(cb) { cb(client); }
	});
};

module.exports.processFile = function(client, sqlFile, cb)
{
	client.query(sqlFile, function(err, result)
	{
		if(err) { throw err; }
		process.stdout.write(' Successful'.green);
		if(cb) { cb(client); }
	});	
};
