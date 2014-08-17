(function() {
  'use strict';

  var lcov_file = './coverage/lcov.info';
  var coveralls = './node_modules/coveralls/bin/coveralls.js';

  module.exports = {
    coveralls: {
      command: 'cat ' + lcov_file + ' | ' + coveralls,
      options: {
        stdout: true,
        failOnError: true
      }
    }
  };
})();
