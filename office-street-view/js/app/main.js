// All paths are relative to app dir (js/app)
require.config({
  paths: {
    domReady: '../../bower_components/requirejs-domready/domReady',
    angular: '../../bower_components/angular/angular',
    bindonce: '../../bower_components/angular-bindonce/bindonce'
  },

  shim: {
    angular: {
      exports: 'angular',
    },
    bindonce: {
      deps: ['angular']
    }
  },

  deps: ['ng_bootstrap']
});
