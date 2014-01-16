(function() {
  'use strict';

  var directive_name = 'recompile-watch';

  describe(directive_name + ' directive', function() {
    var $compile, $scope;

    var html =
      '<div recompile-watch="watch">'
      '  <recompile-html>' +
      '    <span bindonce bo-text="val"></span>' +
      '  </recompile-html>' +
      '</div>';

    // Arbitrary values
    var VALS = ['Pizza', 'General Tso\'s Chicken', 'Chocolate'];

    /* global MY_NAMESPACE */
    beforeEach(module('room77.' + MY_NAMESPACE));

    // Bindonce needed to test recompile
    beforeEach(module('pasvaz.bindonce'));

    beforeEach(inject(function(_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
    }));

    _NoWatchChange();
    _WatchAndValChange();

    return;

    /*** Private fns below ***/

    function _WatchAndValChange() {
      it('Doesn\'t change val if watch doesn\'t change', function() {
        $scope.watch = 'Hello';
        $scope.val = VALS[0];

        // Generate the directive
        var elt = $compile(html)($scope);
        $scope.$digest();

        // Expect initial val to be correct
        expect(elt.find('span').html()).toBe(VALS[0]);

        // Change watch and val, html should update
        $scope.watch = 'Goodbye';
        $scope.val = VALS[1];
        $scope.$digest();
        expect(elt.find('span').html()).toBe(VALS[1]);
      });
    }

    function _NoWatchChange() {
      it('Doesn\'t change val if watch doesn\'t change', function() {
        $scope.watch = 'Hello';
        $scope.val = VALS[0];

        // Generate the directive
        var elt = $compile(html)($scope);
        $scope.$digest();

        // Expect initial val to be correct
        expect(elt.find('span').html()).toBe(VALS[0]);

        // Change val and still should be old value
        $scope.val = VALS[1];
        $scope.$digest();
        expect(elt.find('span').html()).toBe(VALS[0]);
      });
    }
  });
})();
