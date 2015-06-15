## Migratory
Imports SQL files into specified DB within a transaction.

For those of you that prefer to use SQL rather than ORMs,
or you just have some DB dumps kicking around that you'd
rather safely import via a transaction.

### Supported RDBMS
* Postgresql
* MySQL

SQLite coming soon...

### Usage:
#### Installation:

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
   "environments":
   {
       "Destination Label": {
           "host": "",
           "database": "",
           "type": "",
           "schema": "",
        }
   },
   "migrationDirectory": "migrations",
   "migratoryManifest": "migratoryManifest.json"
}
```

**environments:** A list of environments (Servers / Databases) to which you will migrate.

   **Destination Label:** A User-Friendly label that you'll recognize as a server. Maybe "Dev", "QA", or "Production"

   **host:** Server on which to deploy

   **database:** Database on which your SQL commands will be executed

   **type:** The Type of DB to connect to. Currently only pgsql, mysql

   **schema:** Optional. Search path to be set. This is only relevant to pgsql.

**Migration Directory:** Directory in which your migration files live (.sql files, etc)

**Migratory Manifest:** Filename of where the manifest will be written.

Credentials will be input at the time of migrations for security reasons.

You can add as many servers as you like into the environments object.

Once you're done you're ready to use Migratory!

#### Running Migrations
Once you're all set up with your migratory.json file you can run your deployments. You'll need to run these deployments from the directory that contains your `migratory.js` file.

```
migratory sqlFile1.sql sqlFile2.sql
```

You will then be prompted to choose the database you wish to import the specified files into.

Once chosen, Migratory will import sqlFile1 and sqlFile2 into specified DB sequentially within a transaction.

There's no limit to the amount of files you can import in one command.
If any errors are encountered, all changes will be rolled back.

#### Login Credentials
These will be asked upon migration for security purposes

#### Directories
Directories included in the list of files to migrate will be recursively descended into. Files and directories will be ordered in alpha descending order within their directory. For example migrating the following directory:

```
| Awesome Changes
+- awesomechange1.sql
+- awesomechange2.sql
| Cool Changes
+- coolchange1.sql
+- Ultra Cool Changes
+-- ultracoolchange1.sql
| greatchange.sql

```

Would yield the following migration order:

1. awesomechange1.sql
2. awesomechange2.sql
3. coolchange1.sql
4. ultracoolchange1.sql
5. greatchange.sql

The file list is not sorted once all files are found; only within their directories. Directories are included in the alpha sort (A directory's name determines where in the sort order its contents will fall)

## Manifest

Migratory will keep a manifest of migrations performed and whether they were successful or if they failed.
It's done in a simple json format.  This file should be environment-specific, and therefore should be added to your gitignore.  This decreases the amount of hunt and peck involved with working with migrations as part of a team.  Once your manifest is up to date, you can simply run migratory on your migrations directory to migrate any files that haven't been migrated to the chosen server.

The manifest is broken down by server. If you've successfully migrated a file to Server 1, and you try to migrate the same file to Server 1 you will be prompted that you've already migrated that file to that server. You will be given an option to continue if you so choose.  You will not be prompted if, for instance, you've migrated that file to Server 1 (Maybe Dev Server), and are now trying to migrate it to Server 2 (Maybe QA Server).

Files are scrubbed against their checksums instead of their filenames. If you have a file named 'AwesomeTable.sql', migrate it, then make changes to it and try to migrate it again, the manifest will not register that it's been migrated already since its contents have changed.

*Here's an example of a small manifest file:*

```
{
   "mysql:migratory@localhost": {
      "successful": [
         {
            "checksum": "da39a3ee5e6b4b0d3255bfef95601890afd80709",
            "dates": [
               "2015-06-15T14:01:03.033Z"
            ],
            "names": [
               "migrations/sql1.sql",
               "migrations/sql2.sql",
            ]
         },
         {
            "checksum": "34020c50be4b29c34a46f6c610d0c022ffeb1de6",
            "dates": [
               "2015-06-15T14:01:03.033Z"
            ],
            "names": [
               "migrations/sql2.sql"
            ]
         }
      ],
      "failure": []
   }
}
```

## Upgrades
Upon running, Migratory will check to see if you need to upgrade your settings file. We've changed the format of the settings file for the manifest release.

If you need to upgrade, you will be prompted.  Simply run

```
migratory upgrade
```

This will run you through the process of upgrading whatever needs to be upgraded in your settings file. It will only take a couple seconds.

### Foreseeable updates:
* Input variables by commandline (Server, Credentials, etc)
* Grunt / Gulp integration
* Credentials files
* Option to use database for manifest (Potentially useful if many pushing to same server independently, rather from centralized build server.)
* Different import actions (up/down -- this will require directory structure, additional files)

Pull requests welcome.

version 0.0.16a
