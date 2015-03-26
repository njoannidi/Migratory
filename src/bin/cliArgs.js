
/*
   Each of the following will be checked with handle method.
   If Check evaluates to true, action will be run.
 */
var args;

args = {
  noFile: {
    check: function() {
      return process.argv.length < 3;
    },
    action: function() {
      console.log('No File selected, Aborting. \nFor help please use -h');
      return process.exit(1);
    }
  },
  help: {
    check: function() {
      return process.argv[2] === '-h' || process.argv[2] === 'help';
    },
    action: function() {
      console.log('Migratoy\n\nReads SQL files and imports into specified DB within a transaction\n\nUsage:\nmigratory [sqlFile1] [sqlFile2]\n\nImports [sqlFile1] and [sqlFile2] sequentially within a transaction.\nThere is no limit to the amount of files you can include here.\nIf any errors are encountered, the changes will automatically be rolled back if possible.\n\nSettings File: migratory.js\nTo generate a new settings file, run:\nmigratory init\n\nLogin credentials will be asked upon migration.\nMore info in README.md');
      return process.exit(0);
    }
  },
  init: {
    check: function() {
      return process.argv[2] === 'init';
    },
    action: function() {
      var currPath, e, fs, initOut, settingsBase;
      fs = require('fs');
      currPath = process.cwd();
      if (fs.existsSync(currPath + '/' + 'migratory.json')) {
        console.log('Unable to create migratory.json\nCurrent directory already contains a file called migratory.json');
        process.exit(1);
      }
      settingsBase = {
        "Destination Label": {
          "host": "",
          "database": "",
          "type": "",
          "schema": ""
        }
      };
      console.log('Writing migratory.json to: ' + currPath + '/migratory.json');
      initOut = JSON.stringify(settingsBase, null, 4);
      try {
        fs.writeFileSync('migratory.json', JSON.stringify(settingsBase, null, 4));
      } catch (_error) {
        e = _error;
        console.log(e);
        process.exit(1);
      }
      console.log('Success!');
      return process.exit(0);
    }
  }
};

exports.handle = function(cb) {
  var i;
  for (i in args) {
    if (args[i].check()) {
      args[i].action();
    }
  }
  return cb();
};
