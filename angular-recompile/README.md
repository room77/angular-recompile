Recompile library for AngularJS
===

Include ```dist/recompile.js``` to start using.

Sample usage
---
```html
<div recompile-when="person.name">
  <div recompile-html>
    <div ng-init="Init(person)">
      <span bindonce bo-text="person.name"></span>
      <span bindonce bo-text="person.height"></span>
      <span bindonce bo-text="person.favorite_karaoke_tune"></span>
    </div>
    <!-- More code to recompile -->
  </div>
</div>
```

Recompile triggers
---
These are directives that set a <code>$watch</code> and trigger a recompile on different conditions.

| Directive | Triggers a recompile ... |
| --- | --- | --- |
| ```recompile-watch="val"``` | whenever watch is fired |
| ```recompile-when="val"``` | when ```val``` evaluates to a Javascripty truthy |
| ```recompile-deep-watch="val"``` | same as ```recompile-watch``` only with a deep equality check for objects |
| ```recompile-watch-collection="val"``` | used when ```val``` is an array, see documentation for ```$watchCollection``` for when watch is fired |
| ```recompile-once-when="val"``` | only on the first time ```val``` evalutes to a Javascript truthy |

Other directives
---
| Directive | Description |
| --- | --- | --- |
| ```recompile-stop-watch-if="val2"``` | MUST be paired with a recompile trigger.  It will remove the watch if the ```val``` on the recompile trigger evaluates to the same as ```val2```  |
| ```recompile-until="val2"``` | MUST be paired with ```recompile-html```.  If ```val2``` evaluates to a Javascript truthy, then the ```recompile-html``` will not be triggered again |


To play with code
---
* You need to install the packages needed by the unit tests: ```bower update``` and ```sudo npm install```
* ```grunt``` builds the dist and runs the unit tests
* If you add a directive, make sure to add a spec to ```test/```
* The namespace of all of the directives (default is ```recompile```) can be changed in ```src/namespace.js``` (so if the namespace is `foo`, then the corresponding directives are ```foo-when```, ```foo-deep-watch```,  ```foo-html```, etc.)

TODO
* make public
* make it Bower-able
* add necessary documentation
