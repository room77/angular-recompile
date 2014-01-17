define(['my_namespace'], function(MY_NAMESPACE) {
  'use strict';

  return {
    // Keep this sync'd with src/directives.js
    DirectiveName: function(name) {
      return MY_NAMESPACE + '-' + name.replace('_', '-');
    }
  };
});
