define([
  './util/html_template', './util/scenarios', './util/spec_construct',
  './util/util'
], function(html_template, scenarios, SpecConstruct, util) {
  'use strict';

  var my_name = 'until';

  // We want to create watch_states that change the recompile trigger,
  //   change the until trigger, then change the recompile trigger again
  var WATCH_STATES = [{
    attr: 'watch',
    val: 'Donde'
  }, {
    attr: 'watch',
    val: 'Esta'
  }, {
    attr: 'until',
    val: true
  }, {
    attr: 'watch',
    val: 'La'
  }, {
    attr: 'watch',
    val: 'Biblioteca'
  }];

  SpecConstruct(my_name, [{
    desc: 'Stops the element from recompiling',
    test: _UntilTest()
  }, {
    desc: 'Doesn\'t stop a sibling recompile-html from recompiling',
    test: _SiblingTest()
  }, {
    desc: 'Throws error if not paired with a recompile-html',
    test: scenarios.ExpectException(html_template.Nested('watch', my_name))
  }, {
    desc: 'No error if until fires and later $scope is $destroyed',
    test: _DestroyTest()
  }]);

  return;

  /*** Private fns below ***/

  function _UntilTest() {
    var html =
      '<div ' + util.HtmlName('watch') + '="watch">' +
      '  <div ' + util.HtmlName('html') + ' ' +
            util.HtmlName('until') + '="until">' +
      '    <div ng-init="Init()"></div>' +
      '  </div>' +
      '</div>';

    // We expect the last two watch triggers not to fire, because until
    //   evaluates to a truthy
    return scenarios.ExpectNRecompilesMultipleWatches(2, html, WATCH_STATES);
  }

  function _SiblingTest() {
    var html =
      '<div ' + util.HtmlName('watch') + '="watch">' +
      '  <div ' + util.HtmlName('html') + ' ' +
           util.HtmlName('until') + '="until">' +
      '  </div>' +
      '  <div ' + util.HtmlName('html') + '>' +
      '    <div ng-init="Init()"></div>' +
      '  </div>' +
      '</div>';

    // We expect the latter recompile-html to fire for all watch triggers
    return scenarios.ExpectNRecompilesMultipleWatches(4, html, WATCH_STATES);
  }

  function _DestroyTest() {
    return function($compile, $scope) {
      // Run the basic until test
      _UntilTest().apply(this, arguments);

      var until_and_destroy = function() {
        $scope.$destroy();
      };

      expect(until_and_destroy).not.toThrow();
    };
  }
});
