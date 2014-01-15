(function() {
  'use strict';

  var ctrl_name = 'RecompileCtrl';
  describe(ctrl_name, function() {
    var $scope, RecompileCtrl;

    /* global MY_NAMESPACE */
    beforeEach(module('room77.' + MY_NAMESPACE));

    beforeEach(inject(function($controller, $rootScope) {
      $scope = $rootScope.$new();
      RecompileCtrl = $controller(ctrl_name, { $scope: $scope });
    }));

    it('Calls all registered fns', function() {
      var method1 = jasmine.createSpy('method 1'),
          method2 = jasmine.createSpy('method 2');

      RecompileCtrl.RegisterFn(method1);
      RecompileCtrl.RegisterFn(method2);
      RecompileCtrl.RunFns();

      expect(method1).toHaveBeenCalled();
      expect(method2).toHaveBeenCalled();
    });

    it('Doesn\'t call anything if scope destroyed', function() {
      var method1 = jasmine.createSpy('method 1');

      RecompileCtrl.RegisterFn(method1);
      $scope.$destroy();
      RecompileCtrl.RunFns();

      expect(method1).not.toHaveBeenCalled();
    });
  });
})();
