define([
  '../../app/my_namespace', 'mocks'
], function(my_namespace, from_server_mock) {
  'use strict';

  var ctrl_name = 'OfficeStreetViewCtrl';
  describe(ctrl_name, function() {
    var $scope;

    beforeEach(module(my_namespace + '.controllers'));

    // We need this to get access to from_server
    beforeEach(module(my_namespace + '.services'));

    beforeEach(inject(function($controller, $rootScope) {
      $scope = $rootScope.$new();

      // Use a mocked version of the cube service
      $controller(ctrl_name, { $scope: $scope });
    }));

    it('should be loaded', function() {
      expect(true).toBe(true);
    });
  });
});
