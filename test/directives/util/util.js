define(['my_namespace'], function(MY_NAMESPACE) {
  'use strict';

  return {
    // Keep this sync'd with src/directives.js
    //   This is what is displayed for a directive in the html
    //   e.g. 'deep_watch' => recompile-deep-watch
    HtmlName: function(name) {
      return (MY_NAMESPACE + '_' + name).replace(/_/g, '-');
    }
  };
});
