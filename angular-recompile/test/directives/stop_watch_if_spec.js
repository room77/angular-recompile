define([
  './util/html_template', './util/scenarios', './util/spec_construct'
], function(html_template, scenarios, SpecConstruct) {
  'use strict';

  var my_name = 'stop_watch_if';

  SpecConstruct(my_name, [{
    desc: 'Throws error if not paired with a recompile trigger',
    test: scenarios.ExpectException(html_template.Nested(my_name))
  }, {
    desc: 'No more recompiles once stop-watch-if matches watch',
    test: _StopWatchTest()
  }]);

  return;

  /*** Private fns below ***/

  function _StopWatchTest() {
    var html = html_template.OnSameElt('watch', {
      name: my_name,
      attr: '\'Be\''
    });

    return scenarios.ExpectNRecompiles(3, html, [
      'Let', 'It', 'Be', 'Let', 'It', 'Be'
    ]);
  }
});
