(function() {
  'use strict';

  module.exports = {
    src: ['dist/**/*.js'],
    options: {
      outfile: '_SpecRunner.html',

      // Use this for debugging
      keepRunner: true,

      specs: ['test/**/*_spec.js'],

      // Source needs Angular, otherwise include things through requirejs
      vendor: [
        'bower_components/angular/angular.js'
      ],

      template: require('grunt-template-jasmine-istanbul'),
      templateOptions: {
        coverage: 'coverage/lcov.info',
        report: {
          type: 'lcov',
          options: {
            dir: 'coverage'
          }
        },

        template: require('grunt-template-jasmine-requirejs'),
        templateOptions: {
          requireConfigFile: 'test/test_main.js'
        }
      }
    }
  };
})();
