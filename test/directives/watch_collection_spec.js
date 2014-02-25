define([
  './util/html_template', './util/scenarios', './util/spec_construct'
], function(html_template, scenarios, SpecConstruct) {
  'use strict';

  var my_name = 'watch_collection';

  SpecConstruct(my_name, [{
    desc: 'Recompiles if data inside watch array changes',
    test: scenarios.ExpectARecompile(html_template.Nested(my_name), [
      ['Hello', 'World'],
      ['Goodbye', 'World']
    ])
  }, {
    desc: 'Doesn\'t recompile if data inside watch array doesn\'t change',
    test: scenarios.DontExpectARecompile(html_template.Nested(my_name), [
      ['Hello', 'World'],
      ['Hello', 'World']
    ])
  }]);
});
