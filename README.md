##Migratory
Imports SQL files into specified DB within a transaction.

For those of you that prefer to use SQL rather than ORMs,
or you just have some DB dumps kicking around that you'd 
rather safely import via a transaction.

Can be used to populate structure, data or both.

Compatible with database dumps.

###Usage:
####Installation:

Preferred method of installation is globally via npm:

```
npm install -g migratory
```

Any projects in which you'd like to use Migratory, first run:

```
migratory init
```

This will create a base settings file (migratory.json) that looks something like this:

```

{
    "Destination Label": {
        "host": "",
        "database": "",
        "schema": ""
     }
}
```
**Destination Label:** A User-Friendly label that you'll recognize as a server. Maybe "Dev", "QA", or "Production"

**host:** Server on which to deploy

**database:** Database on which your SQL commands will be executed

**schema:** Optional. Search path to be set.


Credentials will be input at the time of migrations for security reasons.

You can add as many servers as you like into this json object; local or remote.

Once you're done, you're ready to use Migratory!

#### Running Migrations
Once you're all set up with your migratory.json file, you can run your deployments. You'll need to run these deployments from the directory that contains your migratory.js file.

```
migratory sqlFile1 sqlFile2
```

You will then be prompted to choose the database you wish to import the specified files into.

Once chosen, Migratory will import sqlFile1 and sqlFile2 into specified DB sequentially within a transaction.

There's no limit to the amount of files you can import in one command.
If any errors are encountered, all changes will be rolled back.

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

version 0.0.1b
