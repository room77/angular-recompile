define([
  './util/arbitrary_vals', './util/html_template', './util/spec_construct'
], function(VALS, html_template, SpecConstruct) {
  'use strict';

  var my_name = 'watch';

  SpecConstruct(my_name, [{
    desc: 'Changes vals if watch changes',
    test: _WatchAndValChange
  }, {
    desc: 'Doesn\'t change val if watch doesn\'t change',
    test: _NoWatchChange
  }]);

  return;

  /*** Private fns below ***/

  function _WatchAndValChange($compile, $scope) {
    $scope.watch = 'Hello';
    $scope.val = VALS[0];

    // Generate the directive
    var elt = $compile(html_template.Nested(my_name))($scope);
    $scope.$digest();

    // Expect initial val to be correct
    expect(elt.find('span').html()).toBe(VALS[0]);

    // Change watch and val, html should update
    $scope.watch = 'Goodbye';
    $scope.val = VALS[1];
    $scope.$digest();
    expect(elt.find('span').html()).toBe(VALS[1]);
  }

  function _NoWatchChange($compile, $scope) {
    $scope.watch = 'Hello';
    $scope.val = VALS[0];

    // Generate the directive
    var elt = $compile(html_template.Nested(my_name))($scope);
    $scope.$digest();

    // Expect initial val to be correct
    expect(elt.find('span').html()).toBe(VALS[0]);

    // Change val and still should be old value
    $scope.val = VALS[1];
    $scope.$digest();
    expect(elt.find('span').html()).toBe(VALS[0]);
  }
});