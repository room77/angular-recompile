(function() {
  'use strict';

  module.exports = {
    // Ensure that the generated file we want exists
    check_data: {
      command: 'ls data/generated/cube_map.json',
      options: {
        stdout: true,
        failOnError: true,
        callback: function(error, stdout, stderr, original_callback) {
          // Call original callback
          original_callback.apply(this, arguments);

          if (error) {
            var error_msg =
              '\n*** Error: run \'grunt build:data\' to generate data ***\n';

            console.error(error_msg);
          }
        }
      }
    },

    generate_data: {
      command: [
        'cd data',
        './dl_cardlist.sh',
        './mtg_lookup.py',
        'cd ..'
      ].join(' && '),
      options: {
        stdout: true,
        failOnError: true
      }
    }
  };
})();
