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

  /* global MY_NAMESPACE */
  var module = angular.module('room77.' + MY_NAMESPACE),

  // This is an array of the directives, used by the recompile-html directive
  //   to obtain the controllers of the recompile triggers
      recompile_triggers_require_array = [];

  angular.forEach(recompile_triggers, function(recompile_trigger) {
    var angular_name = _AngularName(recompile_trigger.name);

    // Requires are both optional and can be on the parent
    recompile_triggers_require_array.push('?^' + angular_name);

    // Register trigger directive
    module.directive(angular_name, function() {
      return {
        controller: 'RecompileCtrl',
        scope: true,
        link: _RecompileTriggerLinkFn(recompile_trigger)
      };
    });
  });

  // Register the directive that recompiles the html
  module.directive(_AngularName('html'), function() {
    return {
      restrict: 'EA',
      require: recompile_triggers_require_array,
      transclude: true,
      link: _RecompileHtmlLinkFn()
    };
  });

  // recompile-until has to be paired with a recompile-html
  module.directive(_AngularName('until'), function() {
    return {
      link: function(scope, elt, attrs) {
        if (!attrs.hasOwnProperty(_AngularName('html'))) {
          throw 'recompile-until needs to be paired with recompile-html';
        }
      }
    };
  });

  // recompile-stop-watch-if has to be paired with a recompile trigger
  module.directive(_AngularName('stop_watch_if'), function() {
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
  function _AngularName(name) {
    return (MY_NAMESPACE + '_' + name).replace(/_(\w)/g, _Capitalize);

    function _Capitalize(match, letter) {
      return letter.toUpperCase();
    }
  }

  /* Switches the name to use dashes instead of underscores and puts the
   *   desired namespace in front of the name
   */
  function _HtmlName(name) {
    // TODO
    return (MY_NAMESPACE + '_' + name).replace(/_/g, '-');
  }

  // TODO add comments
  function _RecompileTriggerLinkFn(recompile_trigger) {
    return function(scope, elt, attrs, RecompileCtrl) {
      var angular_name = _AngularName(recompile_trigger.name),
          watch_fn;

      // Choose between normal watch, or array watch
      if (recompile_trigger.watch_array) watch_fn = scope.$watchCollection;
      else watch_fn = scope.$watch;

      /* jshint -W074 */
      var watch_remover = watch_fn.call(
        scope, attrs[angular_name], _WatchFn, recompile_trigger.deep_check
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
    var angular_name = _AngularName('stop_watch_if');

    if (attrs[angular_name]) {
      return watch_val === scope.$eval(attrs[angular_name]);
    }

    return false;
  }

  function _RecompileHtmlLinkFn() {
    /* jshint -W074 */
    return function(scope, elt, attrs, Ctrls, transclude_fn) {
      var RecompileCtrl = null,

      // We keep track if our transclude fn was deregistered
          deregistered = false,
          child_scope = null;

      var current_elt = elt;
      while (current_elt.length > 0) {
        // Let's look on elt for the right attributes
        /* jshint -W083 */
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

      var until_angular_name = _AngularName('until');
      if (attrs[until_angular_name]) {
        var until_watch_remover = scope.$watch(attrs[until_angular_name],
          function UntilWatch(new_val) {
            if (new_val) {
              _Deregister();
              until_watch_remover();
              until_watch_remover = null;
            }
          }
        );
      }

      // Initialize the elt
      _TranscludeElt();
      RecompileCtrl.RegisterFn(_TranscludeElt);

      scope.$on('$destroy', function() {
        _Deregister();
      });

      return;

      function _TranscludeElt() {
        if (child_scope) child_scope.$destroy();
        child_scope = scope.$new();

        transclude_fn(child_scope, function(clone) {
          elt.empty().append(clone);
        });
      }

      function _Deregister() {
        if (!deregistered) {
          deregistered = true;

          // Clean up variables
          RecompileCtrl.DeregisterFn(_TranscludeElt);
          RecompileCtrl = null;
          child_scope = null;
        }
      }
    }; // End link array.
  }
})();
