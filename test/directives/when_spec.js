define([
  './util/html_template', './util/scenarios', './util/spec_construct'
], function(html_template, scenarios, SpecConstruct) {
  'use strict';

  var my_name = 'when';

  SpecConstruct(my_name, [{
    desc: 'Recompiles if watch changes to a Javascript truthy',
    test: scenarios.ExpectARecompile(html_template.Nested(my_name), [
      'Hello', 'Goodbye'
    ])
  }, {
    desc: 'Doesn\'t recompile if watch changes to a Javascript falsy',
    test: scenarios.DontExpectARecompile(html_template.Nested(my_name), [
      'Hello', ''
    ])
  }]);
});
