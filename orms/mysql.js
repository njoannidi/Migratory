var pg = require('mysql');
var fs = require('fs');

module.exports.connect = function(credentials, cb)
{
	var connection = mysql.createConnection(host: credentials.host, user: credentials.username, password: credentials.password, database: credentials.database);

	connection.connect(function(err)
	{
		if(err){ throw err; }

		process.stdout.write('Successful'.green+'\n');
		if(cb){ cb(connection) };
	});
};

module.exports.setSchema = function(client, schema, cb)
{
	// No schemas in MySQL.
	console.log('\nSchemas are not supported in MySQL... Moving on. (Schema for this connection set to: '.green + credentials.schema + ')');
	cb();
};

module.exports.beginTransaction = function(client, cb)
{
	client.query('START TRANSACTION', function(err, results)
	{
		if(err) {throw err;}
		if(cb) {return cb();}
	});
};

module.exports.rollback = function(client, success, failure)
{
	client.query('ROLLBACK', function(err, results)
	{
		if(err && failure) { failure(); }
		else if(success) { success(); }
	});
};

module.exports.commit = function(client, cb)
{
	client.query('COMMIT', function(err,result)
	{
		if(err) {throw err;}
		if(cb) { cb(); }
	});
};

module.exports.processFile = function(client, sqlFile, cb)
{
	client.query(sqlFile, function(err, result)
	{
		if(err) { throw err; }
		process.stdout.write(' Successful'.green);
		if(cb) { cb(); }
	});	
};
