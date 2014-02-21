define([
  './util/html_template', './util/scenarios', './util/spec_construct'
], function(html_template, scenarios, SpecConstruct) {
  'use strict';

  var my_name = 'once_when';

  SpecConstruct(my_name, [{
    desc: 'Only recompiles once even with a lot of Javascript truthies',
    test: scenarios.ExpectNRecompiles(1, html_template.Nested(my_name), [
      'Hey', 'Jude', 'Don\'t', 'Make', 'It', 'Bad'
    ])
  }]);
});
