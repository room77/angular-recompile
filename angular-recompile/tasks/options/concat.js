(function() {
  'use strict';

  module.exports = {
    dist: {
      src: [
        'src/namespace.js', 'src/module.js', 'src/controllers.js',
        'src/directives.js'
      ],
      dest: 'dist/recompile.js',
    },

    options: {
      // Let's wrap our concat'd files in a closure
      banner: '(function() {\n\'use strict\';\n\n',
      footer: '\n})(); // End initial closure.',

      nonull: true
    }
  };
})();
