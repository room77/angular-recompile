(function() {
  'use strict';

  module.exports = function(grunt) {
    // Configure Grunt
    var grunt_config = {
      pkg: grunt.file.readJSON('package.json')
    };
    _LoadTasksIntoConfig(grunt_config, './tasks/options/');

    grunt.initConfig(grunt_config);

    // Load NPM plugin Grunt tasks
    require('load-grunt-tasks')(grunt);

    // Register custom tasks
    grunt.registerTask('default', ['test']);

    // Dev tasks
    grunt.registerTask('build', ['lint', 'concat']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['build', 'jasmine']);
    grunt.registerTask('github', ['test', 'shell:coveralls']);
  };

  return;

  // Idea to load from multiple files is from this site:
  //   http://www.thomasboyt.com/2013/09/01/maintainable-grunt.html
  function _LoadTasksIntoConfig(config, path) {
    var glob = require('glob');
    var key;

    glob.sync('*', {cwd: path}).forEach(function(option) {
      key = option.replace(/\.js$/,'');
      config[key] = require(path + option);
    });

    return config;
  }
})();
