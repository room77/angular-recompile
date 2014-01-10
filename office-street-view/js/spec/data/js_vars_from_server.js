/* @author holman
 *
 * We use this utility to mock the JS vars retrieved from the server
 */

define(['angular'], function(angular) {
  return {
    Set: function(data) {
      window.JS_VARS_FROM_SERVER = angular.copy(data);
    }
  };
});
