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
      // Let's wrap our concat'd files in a closure and also add a opening
      //   comment
      banner: _OpeningComment() + '\n\n(function() {\n\'use strict\';\n\n',
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

  return;

  function _OpeningComment() {
    return [
      '/**',
      ' * Recompile library for AngularJS',
      ' * version: TODO',
      ' *',
      ' * NOTE: It\'s best to not directly edit this file.  Checkout',
      ' *   this repo and edit the files in src/.  Then run \'grunt\' on the',
      ' *   command line to rebuild dist/recompile.js',
      ' */'
    ].join('\n');
  }
})();
