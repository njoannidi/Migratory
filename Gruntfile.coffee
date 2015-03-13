module.exports = (grunt) ->
	grunt.initConfig {
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['bin/*', 'orms/*']
		}
	}

	grunt.loadNpmTasks 'grunt-contrib-jshint'
