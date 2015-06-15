fs = require 'fs'
os = require 'os'
checksum = require './checksum.js'
manifest = require './manifest.js'

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
            files.push fileParser.getInfo req
         else

            files = files.concat(@getFilesInDirectoryRecursive(req))

      files

   getFilesInDirectoryRecursive: (dir) ->
      files = []

      if dir.substr(-1) isnt @slash()
         dir = dir + @slash()

      for file in fs.readdirSync dir
         try
            isDirectory = fs.lstatSync(dir+file).isDirectory()
         catch Exception
            process.stderr.write "\nError descending into directory: #{dir}.\r\n".magenta
            process.exit 1

         if isDirectory
            files = files.concat @getFilesInDirectoryRecursive(dir+file)
         else
            files.push(fileParser.getInfo(dir + file))

      files.sort()

      files


   getInfo: (fileName) ->
      fileInfo = {}
      fileInfo.name = fileName
      fileInfo.checksum = checksum.getFromString(fs.readFileSync(fileName).toString())

      fileInfo

module.exports = fileParser
