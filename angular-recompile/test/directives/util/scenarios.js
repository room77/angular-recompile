define([], function() {
  'use strict';

  /* These scenarios should return a function whose parameters match those
   *   described in spec_construct.js (see documentation on parameter 'specs')
   */
  return {
    // Tests if a change in watch triggers a recompile
    //  - watch_state should be an array of length 2
    ExpectARecompile: function(html, watch_states) {
      return _ShouldIExpectARecompile(true, html, watch_states);
    },

    DontExpectARecompile: function(html, watch_states) {
      return _ShouldIExpectARecompile(false, html, watch_states);
    },

    ExpectNRecompiles: _ExpectNRecompiles,

    ExpectNRecompilesMultipleWatches: _ExpectNRecompilesMultipleWatches,

    ExpectException: function(html) {
      return function($compile, $scope) {
        // Generate the directive
        var MakeHtml = function() {
          $compile(html)($scope);
        };

        expect(MakeHtml).toThrow();
      };
    }
  };

  function _ShouldIExpectARecompile(expect_recompile, html, watch_states) {
    if (watch_states.length !== 2) throw 'watch_states should be length 2';

    var n_expected_recompiles = 0;

    // watch_state[0] triggers a recompile if it's not undefined
    if (typeof watch_states[0] !== 'undefined') n_expected_recompiles++;
    if (expect_recompile) n_expected_recompiles++;

    return _ExpectNRecompiles(n_expected_recompiles, html, watch_states);
  }

  function _ExpectNRecompiles(n_recompiles, html, watch_states) {
    var watch_states_as_objects = [];
    for (var i = 0; i < watch_states.length; i++) {
      watch_states_as_objects.push({
        attr: 'watch',
        val: watch_states[i]
      });
    }

    return _ExpectNRecompilesMultipleWatches(
      n_recompiles, html, watch_states_as_objects
    );
  }

  function _ExpectNRecompilesMultipleWatches(n_recompiles, html,
      watch_states) {

    return function($compile, $scope) {
      $scope.Init = jasmine.createSpy('Inner recompile fn');

      // Generate the directive
      $compile(html)($scope);

      for (var i = 0; i < watch_states.length; i++) {
        var watch_state = watch_states[i],
            attr = watch_state.attr,
            val = watch_state.val;

        $scope[attr] = val;
        $scope.$digest();
      }

      // Init is always run on $compile, so let's subtract 1 from actual count
      expect($scope.Init.callCount - 1).toBe(n_recompiles);
    };
  }
});
