fs = require 'fs'

module.exports =
   parse: (fileArgs) ->
      directoryNotification = false
      files = []

      for req in fileArgs
         if not fs.existsSync req
            process.stderr.write '\nImport request '.magenta + file.yellow + ' does not exist. Please check path.'.magenta + '\n'
            process.exit 1

         if not fs.lstatSync(req).isDirectory()
            files.push req
         else
            if not directoryNotification
               console.log '\r\nDirectory detected. Processing all files in directories sorted by alpha descending.\r\n'.yellow
               directoryNotifiation = true

            tempFiles = []

            for file in fs.readdirSync req
               try
                  isDirectory = fs.lstatSync(req+file).isDirectory()
               catch Exception
                  process.stderr.write '\nInvalid command; when including a directory please include trailing slash.\r\n'.magenta
                  process.exit 1

               if isDirectory
                  console.log "Recursion not yet supported; ignoring directory ".magenta + "#{req}#{file}\r\n".yellow
               else
                  tempFiles.push req + file

            tempFiles.sort()

            files = files.concat tempFiles

      files
