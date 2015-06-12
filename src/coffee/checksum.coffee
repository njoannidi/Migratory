fs = require 'fs'
crypto = require 'crypto'

hashType = 'sha1'
encoding = 'hex'

module.exports =
   getFromString: (str) ->
      return crypto
            .createHash hashType
            .update str
            .digest encoding
