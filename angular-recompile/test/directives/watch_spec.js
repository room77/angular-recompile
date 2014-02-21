define([
  './util/html_template', './util/scenarios', './util/spec_construct'
], function(html_template, scenarios, SpecConstruct) {
  'use strict';

  var my_name = 'watch';

  SpecConstruct(my_name, [{
    desc: 'Recompiles if watch changes',
    test: scenarios.ExpectARecompile(html_template.Nested(my_name), [
      'Hello', 'Goodbye'
    ])
  }, {
    desc: 'Doesn\'t recompile if watch doesn\'t change',
    test: scenarios.DontExpectARecompile(html_template.Nested(my_name), [
      'Hello', 'Hello'
    ])
  }]);
});
