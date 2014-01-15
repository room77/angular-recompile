(function() {
  'use strict';

  angular.module('room77.' + MY_NAMESPACE).controller('RecompileCtrl', [
    '$scope', '$timeout', RecompileCtrl
  ]);

  return;

  function RecompileCtrl($scope, $timeout) {
    var RecompileCtrl = {},
        _recompile_fns = [],
        _watches = [];

    RecompileCtrl.RegisterFn = function(fn) {
      _recompile_fns.push(fn);
    };

    RecompileCtrl.RunFns = function() {
      for (var i = 0; i < _recompile_fns.length; i++) _recompile_fns[i]();
    };

    RecompileCtrl.AddWatcher = function(handle) {
      _watches.push(handle);
      return handle;
    };

    RecompileCtrl.RemoveWatch = function(handle) {
      if (!handle) return;

      var i;
      for (i = 0; i < _watches.length; i++) {
        if (handle === _watches[i]) break;
      }

      if (i < _watches.length) {
        handle();
        _watches.splice(i, 1);
      }
    };

    RecompileCtrl.RemoveAllWatchers = function() {
      $timeout(function() {
        for (var i = 0; i < _watches.length; i++) {
          if (_watches[i]) _watches[i]();
        }
        _watches = [];
      });
    };

    $scope.$on('$destroy', function() {
      _recompile_fns = [];
      _watches = [];
    });

    return RecompileCtrl;
  }
})(); // End recompile controllers.
