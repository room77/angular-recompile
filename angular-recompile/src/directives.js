function() {
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
    { name: 'watch',
    },
    { name: 'deep_watch',
      deep_check: true
    },
    { name: 'when',
      only_on_true: true
    }
    { name: 'watch_collection'
      watch_array: true
    },
    { name: 'once_when',
      only_on_true: true,
    }
  ];

  /* global MY_NAMESPACE */
  var module = angular.module('room77.' + MY_NAMESPACE);

  var i;
  for (i = 0; i < recompile_triggers.length; i++) {
    var recompile_trigger = recompile_triggers[i];
    var directive_name = _DirectiveName(recompile_trigger.name);

    // Register directive
    module.directive(directive_name, function() {
      return {
        controller: 'RecompileCtrl',
        scope: true,
        link: function(scope, elt, attrs, RecompileCtrl) {
          var watch_fn;

          // Choose between normal watch, or array watch
          if (recompile_trigger.watch_array) watch_fn = scope.$watchCollection;
          else watch_fn = scope.$watch;

          var watch_remover = RecompileCtrl.AddWatcher(watch_fn(attrs[directive_name], function(new_val) {
            if (recompile_trigger.only_when_true && new_val) {
              RecompileCtrl.RunFns();
              if (_ShouldRemove(scope, attrs, new_val)) {
                RecompileCtrl.RemoveWatch(watch_remover);
                watch_remover = null;
              }
            }
          }, recompile_trigger.deep_check));
        }
      };
    });
  }

  return;

  /*** Private fns below ***/

  /* Switches the name to camelCase and puts the desired namespace in front of
   *   the name
   */
  function _DirectiveName(name) {
    // TODO
    return MY_NAMESPACE + name;
  }


  // TODO add comments
  function _ShouldRemove(scope, attrs, watch_val) {
    var directive_name = _DirectiveName('stop_on');

    if (attrs[directive_name]) {
      var is_stop = watch_val === scope.$eval(attrs.r77RecompileStopOn);
      return !attrs.r77RecompileStopOnWhen ? is_stop :
          is_stop === scope.$eval(attrs.r77RecompileStopOnWhen);
    }
    return false;
  }
/*
  // Any one of these r77Recompile directives can place a watch, and at every watch
  //  we recompile the scopes set by r77Recompile
  var r77_recompile_directives = {
    r77RecompileWatch: 'r77-recompile-watch',
    r77RecompileDeepWatch: 'r77-recompile-deep-watch',
    r77RecompileWatchCollection: 'r77-recompile-watch-collection',
    r77RecompileWhen: 'r77-recompile-when',
    r77RecompileOnceWhen: 'r77-recompile-once-when',
    r77RecompileOn: 'r77-recompile-on'
  }

  // We use this to grab the r77 recompile controllers
  var r77_recompile_requires = [];

  // We use this to grab the closest recompile element, and use the appropriate
  //  selector
  var r77_recompile_selector = '';

  var i = 0, n_directives = 0;
  for (var directive in r77_recompile_directives) {
    n_directives++;
  }
  for (var directive in r77_recompile_directives) {
    r77_recompile_requires.push('?^' + directive);

    var translated = r77_recompile_directives[directive];
    r77_recompile_selector += '[' + translated + ']'
        + (i < n_directives - 1 ? ', ' : '');
    i++;
  }

  .directive('r77RecompileWatch', ['r77_util', function(r77_util) {
    return {
      controller: 'RecompileCtrl',
      scope: true,
      link: function(scope, elt, attrs, RecompileCtrl) {
        var watch_remover = RecompileCtrl.AddWatcher(r77_util.watch(
            scope,
            attrs.r77RecompileWatch,
            function(newval, oldval) {
              RecompileCtrl.RunFns();
              if (_ShouldRemove(scope, attrs, newval)) {
                RecompileCtrl.RemoveWatch(watch_remover);
                watch_remover = null;
              }
            }));
      }
    }
  }])
  .directive('r77RecompileDeepWatch', ['r77_util', function(r77_util) {
    return {
      controller: 'RecompileCtrl',
      scope: true,
      link: function(scope, elt, attrs, RecompileCtrl) {
        var watch_remover = RecompileCtrl.AddWatcher(r77_util.watch(
            scope,
            attrs.r77RecompileDeepWatch,
            function(newval, oldval) {
              RecompileCtrl.RunFns();
              if (_ShouldRemove(scope, attrs, newval)) {
                RecompileCtrl.RemoveWatch(watch_remover);
                watch_remover = null;
              }
            }, true));
      }
    }
  }])
  .directive('r77RecompileWatchCollection', ['r77_util', function(r77_util) {
    return {
      controller: 'RecompileCtrl',
      scope: true,
      link: function(scope, elt, attrs, RecompileCtrl) {
        var watch_remover = RecompileCtrl.AddWatcher(r77_util.watchCollection(
            scope,
            attrs.r77RecompileWatchCollection,
            function(newval, oldval) {
              RecompileCtrl.RunFns();
              if (_ShouldRemove(scope, attrs, newval)) {
                RecompileCtrl.RemoveWatch(watch_remover);
                watch_remover = null;
              }
            }));
      }
    }
  }])
  .directive('r77RecompileWhen', ['r77_util', function(r77_util) {
    return {
      controller: 'RecompileCtrl',
      scope: true,
      link: function(scope, elt, attrs, RecompileCtrl) {
        var watch_remover = RecompileCtrl.AddWatcher(r77_util.watch(
            scope,
            attrs.r77RecompileWhen,
            function(newval, oldval) {
              if (newval) RecompileCtrl.RunFns();
              if (_ShouldRemove(scope, attrs, newval)) {
                RecompileCtrl.RemoveWatch(watch_remover);
                watch_remover = null;
              }
            }));
      }
    }
  }])
  .directive('r77RecompileOnceWhen', ['r77_util', function(r77_util) {
    return {
      controller: 'RecompileCtrl',
      scope: true,
      link: function(scope, elt, attrs, RecompileCtrl) {
        var watch_remover = RecompileCtrl.AddWatcher(r77_util.watch(
            scope,
            attrs.r77RecompileOnceWhen,
            function(newval, oldval) {
              if (newval) {
                RecompileCtrl.RunFns();
                RecompileCtrl.RemoveWatch(watch_remover);
                watch_remover = null;
              }
            }));
      }
    }
  }])
  .directive('r77RecompileOn', ['r77_util', function(r77_util) {
    return {
      controller: 'RecompileCtrl',
      scope: true,
      link: function(scope, elt, attrs, RecompileCtrl) {
        var watch_remover = RecompileCtrl.AddWatcher(r77_util.watch(
            scope,
            attrs.r77RecompileOn,
            function() {
              RecompileCtrl.RunFns();
              if (_ShouldRemove(scope, attrs, newval)) {
                RecompileCtrl.RemoveWatch(watch_remover);
                watch_remover = null;
              }
            }));
      }
    }
  }])
  */

  module.directive('r77Recompile', ['$compile', function($compile) {
    return {
      restrict: 'EA',
      require: r77_recompile_requires,
      transclude: true,
      compile: function(cElt, cAttrs, transclude) {
        var cached_html = cElt.html();

        return function(scope, elt, attrs, Ctrls) {
          var RecompileCtrl = null,
              child_scope = null;

          var closest = elt.closest(r77_recompile_selector),
              i = 0;

          for (var directive in r77_recompile_directives) {
            var translated = r77_recompile_directives[directive];
            if (closest.is('[' + translated + ']')) {
              RecompileCtrl = Ctrls[i];
              break;
            }
            i++;
          }

          if (!RecompileCtrl) return;

          if (attrs.r77RecompileUntil) {
            RecompileCtrl.AddWatcher($scope.$watch(scope, attrs.r77RecompileUntil,
            function(val) {
              if (val) RecompileCtrl.RemoveAllWatchers();
            }));
          }

          // Initialize the elt
          _TranscludeElt();
          RecompileCtrl.RegisterFn(_TranscludeElt);

          return;

          function _TranscludeElt() {
            if (child_scope) child_scope.$destroy();
            child_scope = scope.$new();

            transclude(child_scope, function(clone) {
              elt.empty().append(clone);
            });
          }
        } // end link array
      } // end compile definition
    }
  }]);
})();
