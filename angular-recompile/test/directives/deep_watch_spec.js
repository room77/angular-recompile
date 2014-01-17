define([
  './util/html_template', './util/scenarios', './util/spec_construct'
], function(html_template, scenarios, SpecConstruct) {
  'use strict';

  var my_name = 'deep_watch';

  SpecConstruct(my_name, [{
    desc: 'Recompiles if data inside watch object changes',
    test: scenarios.ExpectARecompile(html_template.Nested(my_name), [
      { foo: 'Hello', bar: 'World' },
      { foo: 'Goodbye', bar: 'World' }
    ])
  }, {
    desc: 'Doesn\'t recompile if data inside watch object doesn\'t change',
    test: scenarios.DontExpectARecompile(html_template.Nested(my_name), [
      { foo: 'Hello', bar: 'World' },
      { foo: 'Hello', bar: 'World' }
    ])
  }]);
});
