// @author holman

define(['angular', './module'], function(angular, filters) {
  'use strict';

  var LANG_OVERRIDES = {
    'spa' : 'Español',
    'cmn' : '华语',
    'jpn' : '日本語',
    'fra' : 'le français',
    'vie' : 'tiếng Việt',
    'kor' : '한국어',
    'rus' : 'ру́сский язы́к'
  };

  filters.filter('lang_display_name', ['from_server', function(from_server) {
    var LANG_MAP = angular.copy(from_server.Get('lang_map')) || {};
    angular.extend(LANG_MAP, LANG_OVERRIDES);

    return function(lang) {
      return LANG_MAP.hasOwnProperty(lang) ? LANG_MAP[lang] : lang;
    };
  }]);
});
