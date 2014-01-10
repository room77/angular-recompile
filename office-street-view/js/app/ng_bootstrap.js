require([
  'domReady!', 'angular', './my_namespace', './app'
], function(document, angular, my_namespace) {
  'use strict';
  angular.bootstrap(document, [my_namespace + '.app']);
});
