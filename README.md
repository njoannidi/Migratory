##Migratory
Imports SQL files into specified DB within a transaction.

For those of you that prefer to use SQL rather than ORMs,
or you just have some DB dumps kicking around that you'd 
rather safely import via a transaction.

Can be used to populate structure, data or both.

Compatible with database dumps.

###Usage:
./migratory.js sqlFile1 sqlFile2

Imports sqlFile1 and sqlFile2 into specified DB sequentially within a transaction.
There's no limit to the amount of files you can import in one command.
If any errors are encountered, all changes will be rolled back.

###Settings Files:

####config/*.json

These files should contain settings for any DB you'd want to connect to.

A template of this file is stored in config/dbInfo.json.tmp

####Login Credentials
These will be asked upon migration for security purposes

###RDBMS
* Postgresql

Currently PostgreSql is the only database supported.
We can expand upon this by adding a db-type to the settings file, abstracting the connection and querying.

###Foreseeable updates:
* Importing of all migrations in directory
* Different import actions (up/down -- this will require directory structure, additional files)
* Grunt / Gulp integration

Pull requests welcome.

version 0.0.1a
