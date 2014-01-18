/* Because the directives all do similar things, we have a skeleton spec to
 *   load the correct modules
 *
 * Returns a constructor that takes in the following params:
 *  - name: in underscore form (e.g. watch_collection)
 *  - specs: Object {
 *      desc: name of spec in a String
 *      test: function($compile, $scope) which calls Jasmine expects
 *    }
 */

define([
  'angular', 'my_namespace', './util', 'bindonce', 'mocks'
], function(angular, MY_NAMESPACE, util) {
  'use strict';

  return function SpecSkeleton(name, specs) {
    describe(util.HtmlName(name) + ' directive', function() {
      var $compile, $scope;

      beforeEach(module('room77.' + MY_NAMESPACE));

      // Bindonce needed to test recompile
      beforeEach(module('pasvaz.bindonce'));

      beforeEach(inject(function(_$compile_, $rootScope) {
        $compile = _$compile_;
        $scope = $rootScope.$new();
      }));

      angular.forEach(specs, function(spec) {
        it(spec.desc, function() {
          spec.test($compile, $scope);
        });
      });
    });
  };
});
