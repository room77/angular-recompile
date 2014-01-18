(function() {
'use strict';

/* Set the namespace here!  MY_NAMESPACE = 'foo' will produce:
 *   module: angular.module('room77.foo')
 *   directives: foo-watch, foo-deep-watch...
 *
 * NOTE: We assume that this variable will be all lowercase letters or numbers
 *   Anything different might screw up how directive naming works in
 *   directives.js.
 */
var MY_NAMESPACE = 'recompile';

angular.module('room77.' + MY_NAMESPACE, []);

(function() {
  'use strict';

  angular.module('room77.' + MY_NAMESPACE).controller('RecompileCtrl', [
    '$scope', RecompileCtrlConstructor
  ]);

  return;

  function RecompileCtrlConstructor($scope) {
    var RecompileCtrl = {},
        _recompile_fns = [];

    RecompileCtrl.RegisterFn = function(fn) {
      _recompile_fns.push(fn);
    };

    RecompileCtrl.RunFns = function() {
      for (var i = 0; i < _recompile_fns.length; i++) _recompile_fns[i]();
    };

    RecompileCtrl.RemoveFn = function(fn) {
      var i;
      for (i = 0; i < _recompile_fns.length; i++) {
        if (angular.equals(fn, _recompile_fns[i])) break;
      }

      // Throw error if removing a function not in this array
      if (i >= _recompile_fns.length) {
        throw 'Trying to remove fn not in recompile_fns array';
      }

      _recompile_fns.splice(i, 1);
    };

    $scope.$on('$destroy', function() {
      _recompile_fns = [];
    });

    return RecompileCtrl;
  }
})(); // End recompile controllers.

(function() {
  'use strict';

  /* An array of directives that can trigger a recompile
   *
   * Object: {
   *   name: (in lowercase, separated by underscores) e.g. 'watch_collection'
   *
   *   (The following are all properties, if set to true, they cause certain
   *      behavior in the watch that is created)
   *   deep_check: Object deep comparison in watch
   *   only_when_true: only fires if watch value is Javascript true
   *   watch_array: Array comparision in watch (see $watchCollection)
   *   once: watch removes itself after firing once
   *
   * NOTE: the name will automatically be translated into the right syntaxes
   *   i.e. camelCase for directives and dash-separated for HTML attribute
   */
  var recompile_triggers = [
    { name: 'watch'
    },
    { name: 'deep_watch',
      deep_check: true
    },
    { name: 'when',
      only_when_true: true
    },
    { name: 'watch_collection',
      watch_array: true
    },
    { name: 'once_when',
      only_when_true: true,
      once: true
    }
  ];

  var module = angular.module('room77.' + MY_NAMESPACE),

  // This is an array of the directives, used by the recompile-html directive
  //   to obtain the controllers of the recompile triggers
      recompile_triggers_require_array = [];

  angular.forEach(recompile_triggers, function(recompile_trigger) {
    var directive_name = _DirectiveName(recompile_trigger.name);

    // Requires are both optional and can be on the parent
    recompile_triggers_require_array.push('?^' + directive_name);

    // Register trigger directive
    module.directive(directive_name, function() {
      return {
        controller: 'RecompileCtrl',
        scope: true,
        link: _RecompileTriggerLinkFn(recompile_trigger)
      };
    });
  });

  // Register the directive that recompiles the html
  module.directive(_DirectiveName('html'), function() {
    return {
      restrict: 'EA',
      require: recompile_triggers_require_array,
      transclude: true,
      link: _RecompileHtmlLinkFn()
    };
  });

  // recompile-until has to be paired with a recompile-html
  module.directive(_DirectiveName('until'), function() {
    return {
      require: _DirectiveName('html')
    };
  });

  // recompile-stop-watch-if has to be paired with a recompile trigger
  module.directive(_DirectiveName('stop_watch_if'), function() {
    return {
      require: recompile_triggers_require_array.map(function(directive) {
        // Only look for directives on this element
        return directive.replace('^', '');
      }),
      link: function(scope, elt, attrs, Ctrls) {
        var ctrl_exists = false;
        for (var i = 0; i < Ctrls.length; i++) {
          if (Ctrls[i]) {
            ctrl_exists = true;
            break;
          }
        }

        if (!ctrl_exists) {
          throw 'recompile-stop-watch-if needs to be paired with a ' +
            'recompile trigger';
        }
      }
    };
  });

  return;

  /*** Private fns below ***/

  /* Switches the name to camelCase and puts the desired namespace in front of
   *   the name
   */
  function _DirectiveName(name) {
    return MY_NAMESPACE + name.replace(/(_|^)(\w)/g, _Capitalize);

    function _Capitalize(match, prefix, letter) {
      return letter.toUpperCase();
    }
  }

  /* Switches the name to use dashes instead of underscores and puts the
   *   desired namespace in front of the name
   */
  function _HtmlName(name) {
    // TODO
    return MY_NAMESPACE + '-' + name.replace('_', '-');
  }

  // TODO add comments
  function _RecompileTriggerLinkFn(recompile_trigger) {
    return function(scope, elt, attrs, RecompileCtrl) {
      var directive_name = _DirectiveName(recompile_trigger.name),
          watch_fn;

      // Choose between normal watch, or array watch
      if (recompile_trigger.watch_array) watch_fn = scope.$watchCollection;
      else watch_fn = scope.$watch;

      var watch_remover = watch_fn.call(
        scope, attrs[directive_name], _WatchFn, recompile_trigger.deep_check
      );

      scope.$on('$destroy', function() {
        watch_remover = null;
      });

      return;

      function _WatchFn(new_val) {
        // We trigger the recompile fns if no 'true' condition specified
        //   or if the val is actually true
        if (!recompile_trigger.only_when_true || new_val) {
          RecompileCtrl.RunFns();
          if (recompile_trigger.once ||
              _RemoveTriggerWatch(scope, attrs, new_val)) {
            watch_remover();
            watch_remover = null;
          }
        }
      }
    };
  }

  function _RemoveTriggerWatch(scope, attrs, watch_val) {
    var directive_name = _DirectiveName('stop_watch_if');

    if (attrs[directive_name]) {
      return watch_val === scope.$eval(attrs[directive_name]);
    }

    return false;
  }

  function _RecompileHtmlLinkFn() {
    return function(scope, elt, attrs, Ctrls, transclude_fn) {
      var RecompileCtrl = null,
          child_scope = null;

      var current_elt = elt;
      while(current_elt.length > 0) {
        // Let's look on elt for the right attributes
        angular.forEach(recompile_triggers, function(recompile_trigger, i) {
          var html_name = _HtmlName(recompile_trigger.name);

          if (typeof current_elt.attr(html_name) !== 'undefined') {
            // We keep this loop going to make sure that two recompile
            //   triggers are not on the same elt
            if (RecompileCtrl) {
              throw Error('Two recompile triggers on the same elt');
            }

            RecompileCtrl = Ctrls[i];
          }
        });

        if (RecompileCtrl) break;
        current_elt = current_elt.parent();
      }

      if (!RecompileCtrl) throw Error('Cannot find recompile trigger');

      var until_directive_name = _DirectiveName('until');
      if (attrs[until_directive_name]) {
        var until_watch_remover = scope.$watch(attrs[until_directive_name],
          function UntilWatch(new_val) {
            if (new_val) {
              RecompileCtrl.RemoveFn(_TranscludeElt);
              until_watch_remover();
            }
          }
        );
      }

      // Initialize the elt
      _TranscludeElt();
      RecompileCtrl.RegisterFn(_TranscludeElt);

      scope.$on('$destroy', function() {
        RecompileCtrl = null;
        child_scope = null;
      });

      return;

      function _TranscludeElt() {
        if (child_scope) child_scope.$destroy();
        child_scope = scope.$new();

        transclude_fn(child_scope, function(clone) {
          elt.empty().append(clone);
        });
      }
    }; // End link array.
  }
})();

})(); // End initial closure.