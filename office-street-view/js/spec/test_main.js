// Include modules that are used only by testing here.  If used by the app as
//   well, include in js/app/main.js
//
// Paths are relative to root directory (because that is where grunt runs from)
require.config({
  paths: {
    mocks: 'bower_components/angular-mocks/angular-mocks',
  },

  shim: {
    mocks: {
      deps: ['angular']
    }
  }
});
