define([
  './util/html_template', './util/scenarios', './util/spec_construct'
], function(html_template, scenarios, SpecConstruct) {
  'use strict';

  var my_name = 'html';

  SpecConstruct(my_name, [{
    desc: 'Throws error if no parent recompile trigger',
    test: scenarios.ExpectException(html_template.Nested())
  }, {
    desc: 'Throws error if two recompile triggers on same elt',
    test: scenarios.ExpectException(html_template.OnSameElt('watch', 'when'))
  }, {
    desc: 'Takes on the behavior of the closest recompile trigger',
    test: scenarios.ExpectARecompile(html_template.Nested('when', 'watch'), [
      'Hello', ''
    ])
  }]);
});
