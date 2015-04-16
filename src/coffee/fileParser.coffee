fs = require 'fs'
os = require 'os'

fileParser =
   slash: ->
      if os.platform is 'win32' then '\\' else '/'
   sysPath: (path) ->
      if os.platform is 'win32'
         path.replace /[/]/g, '\\'
      else
         path.replace /[\\]/g, '/'
   parse: (fileArgs, settingsFile) ->
      files = []
      @migrationDirectory = settingsFile.migrationDirectory

      for req in fileArgs
         if not fs.existsSync req
            migrationFile = @sysPath "#{@migrationDirectory}/#{req}"
            if fs.existsSync migrationFile
               req = migrationFile
            else
               process.stderr.write '\nImport request '.magenta + file.yellow + ' does not exist. Please check path.'.magenta + '\n'
               process.exit 1

         if not fs.lstatSync(req).isDirectory()
            files.push req
         else
            console.log '\r\nProcessing all files which, alpha descending in directory: '.green + "#{req}".yellow

            tempFiles = []

            if req.substr -1 is not @slash()
               req = req + @slash()

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

module.exports = fileParser
