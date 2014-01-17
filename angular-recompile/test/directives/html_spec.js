define([
  './util/arbitrary_vals', './util/html_template', './util/spec_construct'
], function(VALS, html_template, SpecConstruct) {
  'use strict';

  var my_name = 'html';

  SpecConstruct(my_name, [{
    desc: 'Throws error if no parent recompile trigger',
    test: _NoRecompileTrigger
  }, {
    desc: 'Throws error if two recompile triggers on same elt',
    test: _RecompileTriggersOnSameElt
  }]);

  // TODO Nested recompiles

  return;

  /*** Private fns below ***/

  function _NoRecompileTrigger($compile, $scope) {
    // Generate the directive
    var MakeHtml = function() {
      $compile(html_template.Nested())($scope);
      $scope.$digest();
    };

    expect(MakeHtml).toThrow();
  }

  function _RecompileTriggersOnSameElt($compile, $scope) {
    // Generate the directive
    var MakeHtml = function() {
      $compile(html_template.OnSameElt('watch', 'when'))($scope);
      $scope.$digest();
    };

    expect(MakeHtml).toThrow();
  }
});
