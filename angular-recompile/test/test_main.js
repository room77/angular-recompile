// Paths are relative to root directory (because that is where grunt runs from)

require.config({
  paths: {
    // Angular is already loaded by Jasmine (because the source file needs it)
    //   This is a dummy file, and it exports the already loaded Angular
    angular: 'test/angular',

    bindonce: 'bower_components/angular-bindonce/bindonce',
    mocks: 'bower_components/angular-mocks/angular-mocks',
    my_namespace: 'src/namespace'
  },

  shim: {
    angular: {
      exports: 'angular'
    },
    bindonce: {
      deps: ['angular']
    },
    mocks: {
      deps: ['angular']
    },
    my_namespace: {
      exports: 'MY_NAMESPACE'
    }
  }
});
