(function() {
  'use strict';

  module.exports = {
    dist: {
      src: [
        'src/namespace.js', 'src/module.js', 'src/controllers.js',
        'src/directives.js'
      ],
      dest: 'dist/recompile.js'
    },

    options: {
      // Let's wrap our concat'd files in a closure
      banner: '(function() {\n\'use strict\';\n\n',
      footer: '\n})(); // End initial closure.',

      // Remove JSHint comments
      process: function(source_code) {
        return source_code
            .replace(/[ ]*\/\* jshint -W\d* \*\/\n/g, '')
            .replace(/[ ]*\/\* global [A-Z_]* \*\/\n/g, '');
      },

      nonull: true
    }
  };
})();
