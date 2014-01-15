;(function() {
  'use strict';

  angular.module('r77.app').controller('RecompileCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    var _me = {},
        _recompile_fns = [],
        _watches = [];

    _me.AddWatcher = function(handle) {
      _watches.push(handle);
      return handle;
    };

    _me.RemoveWatch = function(handle) {
      if (!handle) return;
      var idx = $.inArray(handle, _watches);
      if (idx !== -1) {
        handle();
        _watches.splice(idx, 1);
      }
    };

    _me.RemoveAllWatchers = function() {
      $timeout(function() {
        for (var i = 0; i < _watches.length; i++) {
          if (_watches[i]) _watches[i]();
        }
        _watches = [];
      });
    };

    _me.RegisterFn = function(fn) {
      _recompile_fns.push(fn);
    };

    _me.RunFns = function() {
      for (var i = 0; i < _recompile_fns.length; i++) _recompile_fns[i]();
    };

    $scope.$on('$destroy', function() {
      _recompile_fns = [];
      _watches = [];
    });

    return _me;
  }]);
})();
