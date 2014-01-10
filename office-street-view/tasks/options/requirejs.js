(function() {
  'use strict';

  // Require Lo-Dash to get access to its utility functions
  var _ = require('lodash');

  module.exports = {
    dev: {
      options: _.extend(_RequireJsBaseOptions(), {
        optimize: 'none'
      })
    },
    prod: {
      options: _.extend(_RequireJsBaseOptions(), {
        // Wrap in a closure if we are in prod
        wrap: true
      })
    }
  };

  return;

  function _RequireJsBaseOptions() {
    return {
      // The following urls are relative to root directory
      mainConfigFile: 'js/app/main.js',
      out: 'static/assets/app.js',

      // Following are relative to the mainConfigFile
      name: 'app',
      paths: {
        requireLib: '../../bower_components/requirejs/require'
      },

      // Include RequireJS as part of this build
      include: ['requireLib'],

      // Remove unused files
      removeCombined: true,

      // Keep the out dir (CSS files also live there)
      keepBuildDir: true,

      // Let Compass handle CSS optimizations
      optimizeCss: false,

      // Allow 'use strict';
      useStrict: true
    };
  }
})();
