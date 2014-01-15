(function() {
  'use strict';

  describe('recompile directives', function() {
    var $compile, $scope;

    /* global MY_NAMESPACE */
    beforeEach(module('room77.' + MY_NAMESPACE));

    beforeEach(module('pasvaz.bindonce'));

    beforeEach(inject(function(_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
    }));

    describe('recompile-watch directive', function() {
      it('Works', function() {
        $scope.foo = 'Hello';
        $scope.bar = 'World';
        var html =
          '<div recompile-watch="foo" recompile-html>' +
          '  <span bindonce bo-text="bar"></span>' +
          '</div>';
        var elt = $compile(html)($scope);
        $scope.$digest();
        expect(elt.find('span').html()).toBe('World');

        $scope.bar = 'Hello';
        $scope.$digest();
        expect(elt.find('span').html()).toBe('World');
      });
    });
  });
})();
