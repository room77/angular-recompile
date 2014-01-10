(function() {
  'use strict';

  // Require Lo-Dash to get access to its utility functions
  var _ = require('lodash');

  module.exports = {
    dev: {
      options: _.extend(_CompassBaseOptions(), {
      })
    },
    prod: {
      options: _.extend(_CompassBaseOptions(), {
        environment: 'production'
      })
    }
  };

  return;

  function _CompassBaseOptions() {
    return {
      config: 'css/compass.rb'
    };
  }
})();
