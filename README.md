Recompile library for AngularJS
===

[![Build Status](https://travis-ci.org/room77/angular-recompile.svg?branch=master)](https://travis-ci.org/room77/angular-recompile)
[![Coverage Status](https://img.shields.io/coveralls/room77/angular-recompile.svg)](https://coveralls.io/r/room77/angular-recompile)


Include `dist/recompile.js` to start using.

Sample usage
---
In the following example, there is only one `$watch` set.  When that `$watch` fires, the `ng-init` and the `bindonce` directives will be recompiled, so `Init` will be called and the html will reflect the new values on `person`.

```html
<div recompile-when="person.name">
  <div recompile-html>
    <div ng-init="Init(person)" bindonce>
      <span bo-text="person.name"></span>
      <span bo-text="person.height"></span>
      <span bo-text="person.favorite_karaoke_tune"></span>
    </div>
  </div>
  <!-- Static html -->
  <div recompile-html>
    <!-- More code to recompile -->
  </div>
</div>
```

recompile-html
---
Use the `recompile-html` directive around the HTML you want to recompile.  Only the ***children*** of the element with the `recompile-html` directive will be recompiled (the element itself will not be).

Recompile triggers
---
These are directives that set a <code>$watch</code> and trigger a recompile on different conditions.

| Directive | Triggers a recompile ... |
| --- | --- | --- |
| `recompile-watch="val"` | whenever watch is fired |
| `recompile-when="val"` | when `val` evaluates to a Javascript truthy |
| `recompile-deep-watch="val"` | same as `recompile-watch` only with a deep equality check for objects |
| `recompile-watch-collection="val"` | used when `val` is an array, see documentation for `$watchCollection` for when watch is fired |
| `recompile-once-when="val"` | only on the first time `val` evalutes to a Javascript truthy |

Other directives
---
| Directive | Description |
| --- | --- | --- |
| `recompile-stop-watch-if="val2"` | MUST be paired with a recompile trigger.  It will remove the watch if the `val` on the recompile trigger evaluates to the same as `val2`  |
| `recompile-until="val2"` | MUST be paired with `recompile-html`.  If `val2` evaluates to a Javascript truthy, then the `recompile-html` will not be triggered again |

To play with code
---
* You need to install the packages needed by the unit tests: `bower update` and `sudo npm install`
* `grunt` builds the dist and runs the unit tests
* If you add a directive, make sure to add a spec to `test/`
* The namespace of all of the directives (default is `recompile`) can be changed in `src/namespace.js` (so if the namespace is `foo`, then the corresponding directives are `foo-when`, `foo-deep-watch`,  `foo-html`, etc.)

TODO
---
* make it Bower-able
* add necessary documentation

Author: [golmansax](https://github.com/golmansax)  
Maintainers: [golmansax](https://github.com/golmansax) & [jelinson](https://github.com/jelinson)
