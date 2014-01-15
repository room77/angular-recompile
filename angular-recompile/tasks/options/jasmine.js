(function() {
  'use strict';

  module.exports = {
    src: ['dist/**/*.js'],
    options: {
      // Use this for debugging
      keepRunner: true,

      specs: ['test/**/*_spec.js'],
      vendor: [
        'bower_components/angular/angular.js',
        'bower_components/angular-bindonce/bindonce.js',
        'bower_components/angular-mocks/angular-mocks.js'
      ],

      // Let's load the namespace name so the tests can use it
      helpers: ['src/namespace.js']
    }
  };
})();
