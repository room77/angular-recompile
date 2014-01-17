(function() {
  'use strict';

  module.exports = {
    src: ['dist/**/*.js'],
    options: {
      // Use this for debugging
      keepRunner: true,

      specs: ['test/**/*_spec.js'],

      // Source needs Angular, otherwise include things through requirejs
      vendor: [
        'bower_components/angular/angular.js'
      ],

      template: require('grunt-template-jasmine-requirejs'),
      templateOptions: {
        requireConfigFile: 'test/test_main.js'
      }
    }
  };
})();
