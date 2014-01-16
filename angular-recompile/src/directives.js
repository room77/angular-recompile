(function() {
  'use strict';

  // TODO: abstract out a main link function

  /* An array of directives that can trigger a recompile
   *
   * Object: {
   *   name: (in lowercase, separated by underscores) e.g. 'watch_collection'
   *
   *   (The following are all properties, if set to true, they cause certain
   *      behavior in the watch that is created)
   *   deep_check: Object deep comparison in watch
   *   only_on_true: only fires if watch value is Javascript true
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

  /* global MY_NAMESPACE */
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

      /* jshint -W074 */
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
          if (recompile_trigger.once || _ShouldRemove(scope, attrs, new_val)) {
            watch_remover();
            watch_remover = null;
          }
        }
      }
    };
  }

  function _RecompileHtmlLinkFn() {
    return function(scope, elt, attrs, Ctrls, transclude_fn) {
      var RecompileCtrl = null,
          child_scope = null;

      var current_elt = elt;
      while(current_elt.length > 0) {
        // Let's look on elt for the right attributes
        /* jshint -W083 */
        angular.forEach(recompile_triggers, function(recompile_trigger, i) {
          var html_name = _HtmlName(recompile_trigger.name);
          if (typeof current_elt.attr(html_name) !== 'undefined') {
            RecompileCtrl = Ctrls[i];
            return false;
          }
        });

        if (RecompileCtrl) break;
        current_elt = current_elt.parent();
      }

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

        transclude_fn(child_scope, function(clone) {
          elt.empty().append(clone);
        });
      }
    }; // End link array.
  }
})();
