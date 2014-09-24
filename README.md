# Single Page Application Template

This is a basic setup for a single page application using [Knockout](http://knockoutjs.com/),
[RequireJS](http://requirejs.org/), [Crossroads.js](http://millermedeiros.github.io/crossroads.js/),
[Bootstrap](http://getbootstrap.com/), [jQuery](http://jquery.com/),
[Font Awesome](http://fontawesome.io/) and [Q](http://documentup.com/kriskowal/q/)


## Demo

A demo is available by using the web server integrated in the build.

```sh
gulp watch --server
```

or

```sh
gulp watch --debug --server
```

The later command will disable scripts and styles minification - usually useful for debugging.


## CoffeeScript

A CoffeeScript implementation is available in the [coffee](https://github.com/CrissDev/spa-template-ko/tree/coffee) branch.
It has the same code base and it will be maintained as the master branch evolves.

CoffeeScript compilation is also supported in the master branch -
see [gulpfile.js](https://github.com/CrissDev/spa-template-ko/blob/master/gulpfile.js#L165).


## Install

bower install --save-dev spa-template-ko


## Build

The build system used is [Gulp](http://gulpjs.com/)

```sh
gulp
```

or

```sh
gulp watch
```

The later will build the project and start watching for file changes.


## Test

```sh
karma start
```


## License

MIT © [Cristian Trifan](http://crissdev.com)
