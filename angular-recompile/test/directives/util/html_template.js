define(['./util'], function(util) {
  'use strict';

  var BASIC_RECOMPILE_HTML = '<div ' + util.HtmlName('html') + '>' +
    '  <div ng-init="Init()"></div>' +
    '</div>';

  return {
    /*  NOTE: for any of these functions, the directive parameter can be a
     *    string or an Object (see documentation below for _DirectiveHtml)
     *
     *  Can take any number of parameters, i.e. Nested(name1, name2, name3, ...)
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

      for (var i = args.length - 1; i >= 0; i--) {
        var directive = args[i];
        if (!directive) continue;

        html = '<div ' + _DirectiveHtml(directive) + '>' + html +
          '</div>';
      }

      return html;
    },

    /* <div recompile-name1="watch" recompile-name2="watch">
     *   <span bindonce bo-text="val"></span>
     * </div>
     */
    OnSameElt: function(directive1, directive2) {
      return '<div ' + _DirectiveHtml(directive1) + ' ' +
        _DirectiveHtml(directive2) + '>' +
        BASIC_RECOMPILE_HTML + '</div>';
    }
  };

  /* @param directive can be:
   *  - string: name
   *  - Object: { name, attr: for the directive in html }
   *      e.g. <div HtmlName(name)="attr" ...>
   *
   * If type string is used, then attr is 'watch'
   */
  function _DirectiveHtml(directive) {
    var name, attr;

    if (typeof directive === 'string') {
      name = directive;
      attr = 'watch';
    }
    else if (typeof directive === 'object') {
      name = directive.name;
      attr = directive.attr;
    }
    else throw 'directive should be string or Object';

    return util.HtmlName(name) + '="' + attr + '"';
  }
});
