(function() {
  'use strict';

  module.exports = {
    // Shared options among subtasks
    options: {
      jshintrc: true
    },

    src: ['src/**/*.js'],
    grunt: ['Gruntfile.js', 'tasks/**/*.js']
  };
})();
