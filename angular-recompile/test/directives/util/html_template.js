define(['./util'], function(util) {
  'use strict';

  var BASIC_RECOMPILE_HTML = '<div recompile-html>' +
    '  <span bindonce bo-text="val"></span>' +
    '</div>';

  return {
    /* Can take any number of parameters, i.e. Nested(name1, name2, name3, ...)
     *   and generates a nested tree with directive name1 at the outermost:
     *
     * <div recompile-name1="watch">
     *   <div recompile-name2="watch">
     *     <div recompile-name3="watch">
     *       <div recompile-html>
     *         <span bindonce bo-text="val"></span>  // This is always there
     *   ...
     */
    Nested: function() {
      var args = Array.prototype.slice.call(arguments),
          html = BASIC_RECOMPILE_HTML;

      for (var i = 0; i < args.length; i++) {
        var name = args[i];
        if (!name) continue;

        html = '<div ' + util.DirectiveName(name) + '="watch">' + html +
          '</div>';
      }

      return html;
    },

    /* <div recompile-name1="watch" recompile-name2="watch">
     *   <span bindonce bo-text="val"></span>
     * </div>
     */
    OnSameElt: function(name1, name2) {
      return '<div ' + util.DirectiveName(name1) + '="watch" ' +
        util.DirectiveName(name2) + '="watch">' +
        BASIC_RECOMPILE_HTML + '</div>';
    }
  };
});
