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

    $scope.$on('$destroy', function() {
      _recompile_fns = [];
    });

    return RecompileCtrl;
  }
})(); // End recompile controllers.

(function() {
  'use strict';

  // TODO: abstract out a main link function

  /* An array of directives that can trigger a recompile
   *
   * Object: {
   *   name: (in lowercase, separated by underscores) e.g. 'watch_collection'
   *   link: Angular directive link function
   * }
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
      only_on_true: true
    },
    { name: 'watch_collection',
      watch_array: true
    },
    { name: 'once_when',
      only_on_true: true,
      once: true
    }
  ];

  var module = angular.module('room77.' + MY_NAMESPACE),

  // We use this CSS selector to grab the closest recompile element
  //   (It will be created by iterating through the triggers.)
      recompile_triggers_css_selector = '',

  // This is an array of the directives, used by the recompile-html directive
  //   to obtain the controllers of the recompile triggers
      recompile_triggers_require_array = [];

  angular.forEach(recompile_triggers, function(recompile_trigger) {
    var directive_name = _DirectiveName(recompile_trigger.name);

    // Requires are both optional and can be on the parent
    recompile_triggers_require_array.push('?^' + directive_name);

    // Add a comma if it's not the first trigger (it is the first trigger if
    //   the generated selector is empty)
    recompile_triggers_css_selector += '[' +
        _CssSelectorName(recompile_trigger.name) + ']' +
        (recompile_triggers_css_selector ? ', ' : '');

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
      compile: _RecompileHtmlCompileFn(recompile_triggers_css_selector)
    };
  });

  return;

  /*** Private fns below ***/

  /* Switches the name to camelCase and puts the desired namespace in front of
   *   the name
   */
  function _DirectiveName(name) {
    // TODO
    return MY_NAMESPACE + name;
  }

  /* Switches the name to use dashes instead of underscores and puts the
   *   desired namespace in front of the name
   */
  function _CssSelectorName(name) {
    // TODO
    return MY_NAMESPACE + name;
  }

  // TODO add comments
  function _ShouldRemove(scope, attrs, watch_val) {
    var directive_name = _DirectiveName('stop_on');

    if (attrs[directive_name]) {
      var is_stop = watch_val === scope.$eval(attrs[directive_name]);
      return !attrs.r77RecompileStopOnWhen ? is_stop :
          is_stop === scope.$eval(attrs.r77RecompileStopOnWhen);
    }
    return false;
  }

  function _RecompileTriggerLinkFn(recompile_trigger) {
    return function(scope, elt, attrs, RecompileCtrl) {
      var directive_name = _DirectiveName(recompile_trigger.name),
          watch_fn;

      // Choose between normal watch, or array watch
      if (recompile_trigger.watch_array) watch_fn = scope.$watchCollection;
      else watch_fn = scope.$watch;

      var watch_remover = watch_fn(attrs[directive_name], function(new_val) {
        // We trigger the recompile fns if no 'true' condition specified
        //   or if the val is actually true
        if (!recompile_trigger.only_when_true || new_val) {
          RecompileCtrl.RunFns();
          if (recompile_trigger.once || _ShouldRemove(scope, attrs, new_val)) {
            watch_remover();
            watch_remover = null;
          }
        }
      }, recompile_trigger.deep_check);

      scope.$on('$destroy', function() {
        watch_remover = null;
      });
    };
  }

  function _RecompileHtmlCompileFn() {
    return function(cElt, cAttrs, transclude) {
      return function(scope, elt, attrs, Ctrls) {
        var RecompileCtrl = null,
            child_scope = null;

        var closest = elt.closest(recompile_triggers_css_selector);
        angular.foreach(recompile_triggers, function(recompile_trigger, i) {
          var css_selector_name = _CssSelectorName(recompile_trigger.name);
          if (closest.is('[' + css_selector_name + ']')) {
            RecompileCtrl = Ctrls[i];
            return false;
          }
        });

        if (!RecompileCtrl) return;

        if (attrs.r77RecompileUntil) {
          scope.$watch(scope, attrs.r77RecompileUntil, function(new_val) {
            if (new_val) ;// TODO remove this fn from RecompileCtrl
          });
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

          transclude(child_scope, function(clone) {
            elt.empty().append(clone);
          });
        }
      }; // End link array.
    }; // End compile definition.
  }
})();

})(); // End initial closure.