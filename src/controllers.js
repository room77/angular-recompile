(function() {
  'use strict';

  /* global MY_NAMESPACE */
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

    RecompileCtrl.DeregisterFn = function(fn) {
      var i;
      for (i = 0; i < _recompile_fns.length; i++) {
        if (angular.equals(fn, _recompile_fns[i])) break;
      }

      if (i < _recompile_fns.length) {
        _recompile_fns.splice(i, 1);
      }
    };

    $scope.$on('$destroy', function() {
      _recompile_fns = [];
    });

    return RecompileCtrl;
  }
})(); // End recompile controller
