define([
  '../../app/my_namespace', '../data/js_vars_from_server', '../data/lang_map',
  'mocks'
], function(my_namespace, js_vars_from_server, lang_map) {
  'use strict';

  describe('common filters', function() {
    beforeEach(module(my_namespace + '.filters'));

    // We need this to get access to from_server
    beforeEach(module(my_namespace + '.services'));

    describe('lang_display_name', LangDisplayNameSpec);

    return;

    function LangDisplayNameSpec() {
      var lang_display_nameFilter;

      beforeEach(function() {
        // Filter needs lang map to be set
        js_vars_from_server.Set({
          lang_map: lang_map
        });
      });

      beforeEach(inject(function($injector) {
        // TODO @holman, why doesn't underscore convention work?
        //lang_display_nameFilter = _lang_display_NameFilter_;
        lang_display_nameFilter = $injector.get('lang_display_nameFilter');
      }));

      it('should work for Mandarin', function() {
        expect(lang_display_nameFilter('cmn')).toBe('华语');
      });
    }
  });
});
